import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import constants from "../../../constants/constants.js";
import type { Config } from "../../../types/config.js";
import getDirName from "../../../utils/helpers/get-dir-name.js";

const require = createRequire(import.meta.url);

const resolveAdminBuildPath = (currentDir: string) => {
	const candidatePaths: string[] = [];

	try {
		const adminPackageJsonPath = require.resolve(
			"@content-workers/admin/package.json",
		);
		const adminPackageDir = dirname(adminPackageJsonPath);
		candidatePaths.push(join(adminPackageDir, "dist"));
	} catch {
		// ignore if the dependency isn't installed (e.g. workspace dev)
	}

	candidatePaths.push(
		join(currentDir, "../../../../../", constants.directories.admin, "dist"),
	);

	candidatePaths.push(
		join(currentDir, "../../../../", constants.directories.admin),
	);

	for (const pathCandidate of candidatePaths) {
		if (existsSync(pathCandidate)) {
			return pathCandidate;
		}
	}

	throw new Error(
		"Unable to locate the @content-workers/admin build output. Install the dependency or run `npm run build -w @content-workers/admin`.",
	);
};

/**
 * Resolve all the required paths for the Vite build
 */
const getBuildPaths = (config: Config, cwd = process.cwd()) => {
	const currentDir = getDirName(import.meta.url);
	const adminInput = resolveAdminBuildPath(currentDir);

	return {
		//* the input location for the admin SPA. this is where the admin package outputs its vite build
		adminInput,
		//* the output location for the admin SPA
		adminOutput: join(
			cwd,
			config.compilerOptions.paths.outDir,
			constants.directories.public,
			constants.directories.admin,
		),
		//* the output location for the admin SPA plugins
		adminPluginsOutput: join(
			cwd,
			config.compilerOptions.paths.outDir,
			constants.directories.public,
			constants.directories.admin,
			constants.directories.plugins,
		),
		publicDist: join(
			cwd,
			config.compilerOptions.paths.outDir,
			constants.directories.public,
		),
		clientDistHtml: join(
			cwd,
			config.compilerOptions.paths.outDir,
			constants.directories.public,
			constants.directories.admin,
			"index.html",
		),
	};
};

export default getBuildPaths;
