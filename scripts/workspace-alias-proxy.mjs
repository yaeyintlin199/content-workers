#!/usr/bin/env node
import { spawn } from "node:child_process";

const lifecycle = process.env.npm_lifecycle_event;
const packageName = process.env.npm_package_name;

if (!lifecycle) {
	console.error("workspace-alias-proxy: npm_lifecycle_event is not set");
	process.exit(1);
}

if (!packageName || !packageName.startsWith("@lucidcms/")) {
	console.error(
		"workspace-alias-proxy: package name must start with @lucidcms/ to proxy a workspace command",
	);
	process.exit(1);
}

const targetWorkspace = packageName.replace("@lucidcms/", "@content-workers/");

const child = spawn("npm", ["run", lifecycle, `--workspace=${targetWorkspace}`], {
	stdio: "inherit",
	shell: false,
	env: process.env,
});

child.on("exit", (code) => {
	process.exit(code ?? 0);
});

child.on("error", (error) => {
	console.error("workspace-alias-proxy: failed to run npm command", error);
	process.exit(1);
});
