import { defineConfig } from "tsdown";

export default defineConfig({
	entryPoints: ["src/index.ts", "src/builder.ts"],
	outDir: "dist",
	format: ["esm", "cjs"],
	dts: true,
	splitting: false,
	clean: true,
	treeshake: true,
	minify: false,
	external: ["@lucidcms/core", "hono"],
});
