import T from "../../../translations/index.js";
import getBuildPaths from "../../cli/services/get-build-paths.js";
import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Config, ServiceResponse } from "../../../types.js";
import { join } from "node:path";

const execAsync = promisify(exec);

/**
 * Programatically build the admin SPA with Vite and bundle plugin components.
 */
const buildApp = async (config: Config): ServiceResponse<undefined> => {
    try {
        const paths = getBuildPaths(config);

        // Copy admin SPA files
        await fs.cp(paths.adminInput, paths.adminOutput, { recursive: true });

        // Build plugin components if admin.config exists
        const adminConfigPath = join(paths.adminInput, "plugin.config.ts");
        
        try {
            await fs.access(adminConfigPath);
            
            // Create plugins output directory
            await fs.mkdir(paths.adminPluginsOutput, { recursive: true });

            // Run Vite build for plugins
            const { stdout, stderr } = await execAsync(
                `cd "${paths.adminInput}" && npx vite build --config plugin.config.ts --outDir "${paths.adminPluginsOutput}"`,
            );

            if (stderr) {
                console.warn("Plugin build warnings:", stderr);
            }

            // Generate plugin manifest
            await generatePluginManifest(paths.adminPluginsOutput);

        } catch (accessError) {
            // No plugin config found, skip plugin building
            console.log("No plugin.config.ts found, skipping plugin build");
        }

        return {
            data: undefined,
            error: undefined,
        };
    } catch (err) {
        return {
            data: undefined,
            error: {
                message:
                    err instanceof Error ? err.message : T("vite_build_error_message"),
            },
        };
    }
};

/**
 * Generate a manifest file for all built plugins
 */
const generatePluginManifest = async (outputPath: string) => {
    try {
        const entries = await fs.readdir(outputPath, { withFileTypes: true });
        const pluginDirs = entries.filter(entry => entry.isDirectory());

        const manifest = {
            version: "1.0.0",
            generated: new Date().toISOString(),
            plugins: [] as Array<{
                key: string;
                bundleUrl?: string;
                cssUrl?: string;
                assets: string[];
            }>,
        };

        for (const dir of pluginDirs) {
            const pluginKey = dir.name;
            const pluginDir = path.join(outputPath, pluginKey);
            const files = await fs.readdir(pluginDir);

            const pluginManifest: {
                key: string;
                bundleUrl?: string;
                cssUrl?: string;
                assets: string[];
            } = {
                key: pluginKey,
                assets: files,
            };

            // Find JS bundle
            const jsFile = files.find(f => f.endsWith('.js') && f.includes('chunk'));
            if (jsFile) {
                pluginManifest.bundleUrl = `/admin/plugins/${pluginKey}/${jsFile}`;
            }

            // Find CSS file
            const cssFile = files.find(f => f.endsWith('.css'));
            if (cssFile) {
                pluginManifest.cssUrl = `/admin/plugins/${pluginKey}/${cssFile}`;
            }

            manifest.plugins.push(pluginManifest);
        }

        // Write manifest
        await fs.writeFile(
            path.join(outputPath, "manifest.json"),
            JSON.stringify(manifest, null, 2),
        );

    } catch (err) {
        console.warn("Failed to generate plugin manifest:", err);
    }
};

export default buildApp;
