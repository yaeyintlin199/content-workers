import type { RuntimeBuildArtifactCustom } from "@content-workers/core/types";
import type {
	CloudflareWorkerImport,
	CloudflareWorkerExport,
	CloudflareWorkerExportArtifact,
} from "../types.js";
import constants from "../constants.js";

/**
 * Prepares the main worker entry file and add additional imports/exports from custom artifacts
 */
const prepareMainWorkerEntry = (
	configPath: string,
	customArtifacts: RuntimeBuildArtifactCustom[],
): {
	imports: CloudflareWorkerImport[];
	exports: CloudflareWorkerExport[];
} => {
	const imports: CloudflareWorkerImport[] = [
		{
			path: `./${configPath}`,
			default: "config",
		},
		{
			path: "@content-workers/core",
			default: "lucid",
		},
		{
			path: "@content-workers/core/kv-adapter",
			exports: ["passthroughKVAdapter"],
		},
		{
			path: "@content-workers/core/helpers",
			exports: ["processConfig"],
		},
		{
			path: "./email-templates.json",
			default: "emailTemplates",
		},
		{
			path: "@content-workers/cloudflare-adapter",
			exports: ["getRuntimeContext"],
		},
	];

	const exports: CloudflareWorkerExport[] = [
		{
			name: "fetch",
			async: true,
			params: ["request", "env", "ctx"],
			content: /** ts */ `const resolved = await processConfig(
    config(env, {
        emailTemplates: emailTemplates,
    }),
);

const { app } = await lucid.createApp({
    config: resolved,
    env: env,
    runtimeContext: getRuntimeContext({
        server: "cloudflare",
        compiled: true,
    }),
    hono: {
        middleware: [
            async (app, config) => {
                app.use("*", async (c, next) => {
                    c.env = Object.assign(c.env, env);
                    c.set("cf", env.cf);
                    c.set("caches", env.caches);
                    c.set("ctx", {
                        waitUntil: ctx.waitUntil,
                        passThroughOnException: ctx.passThroughOnException,
                    });
                    await next();
                });
            },
        ],
        extensions: [
            async (app, config) => {
                app.get("/admin/*", async (c) => {
                    const url = new URL(c.req.url);

                    const indexRequestUrl = url.origin + "/admin/index.html";
                    const indexRequest = new Request(indexRequestUrl);
                    const indexAsset = await c.env.ASSETS.fetch(indexRequest);
                    return new Response(indexAsset.body, {
                        status: indexAsset.status,
                        headers: indexAsset.headers,
                    });
                });
            },
        ],
    },
});

return app.fetch(request, env, ctx);`,
		},
		{
			name: "scheduled",
			async: true,
			params: ["controller", "env", "ctx"],
			content: /** ts */ `const runCronService = async () => {
    const resolved = await processConfig(
        config(env, {
            emailTemplates: emailTemplates,
        }),
    );
    const kv = await (resolved.kv ? resolved.kv() : passthroughKVAdapter());

    const cronJobSetup = await lucid.setupCronJobs({
        createQueue: true,
    });
    await cronJobSetup.register({
        config: resolved,
        db: resolved.db.client,
        queue: cronJobSetup.queue,
        env: env,
        kv: kv,
    });
};

ctx.waitUntil(runCronService());`,
		},
	];

	//* merge in worker-export artifacts
	for (const artifact of customArtifacts) {
		if (artifact.type === constants.WORKER_EXPORT_ARTIFACT_TYPE) {
			const custom = artifact.custom as CloudflareWorkerExportArtifact;
			imports.push(...custom.imports);
			exports.push(...custom.exports);
		}
	}

	return { imports, exports };
};

export default prepareMainWorkerEntry;
