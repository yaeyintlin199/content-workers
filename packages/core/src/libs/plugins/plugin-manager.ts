import type { Config } from "../../types/config.js";
import type {
    AdapterRuntimeContext,
    RuntimeBuildArtifact,
} from "../runtime-adapter/types.js";
import type {
    LucidPluginManifest,
    LucidPluginLifecycleContext,
} from "./types.js";
import checkPluginVersion from "../config/checks/check-plugin-version.js";
import LucidError from "../../utils/errors/lucid-error.js";
import { produce } from "immer";
import type { Hono } from "hono";
import type { LucidHonoGeneric } from "../../types/hono.js";
import T from "../../translations/index.js";
import type { LucidErrorData } from "../../types/errors.js";

export class PluginManager {
    private plugins: Map<string, LucidPluginManifest> = new Map();
    private config?: Config;
    private runtimeContext?: AdapterRuntimeContext;

    constructor(plugins: LucidPluginManifest[]) {
        for (const plugin of plugins) {
            if (this.plugins.has(plugin.key)) {
                throw new LucidError({
                    scope: "PluginManager",
                    message: `Duplicate plugin key: ${plugin.key}`,
                });
            }
            this.plugins.set(plugin.key, plugin);
        }
    }

    public validatePlugins() {
        for (const plugin of this.plugins.values()) {
            checkPluginVersion({
                key: plugin.key,
                requiredVersions: plugin.lucid,
            });
        }
    }

    public async executeBuildHooks(props: {
        paths: {
            configPath: string;
            outputPath: string;
            outputRelativeConfigPath: string;
        };
    }): Promise<{
        artifacts: RuntimeBuildArtifact[];
        errors: Array<{ plugin: string; error: LucidErrorData }>;
    }> {
        const artifacts: RuntimeBuildArtifact[] = [];
        const errors: Array<{ plugin: string; error: LucidErrorData }> = [];

        await Promise.all(
            Array.from(this.plugins.values()).map(async (plugin) => {
                if (!plugin.hooks?.build) return;

                const res = await plugin.hooks.build(props);
                if (res.error) {
                    errors.push({ plugin: plugin.key, error: res.error });
                } else if (res.data?.artifacts) {
                    artifacts.push(...res.data.artifacts);
                }
            }),
        );

        return { artifacts, errors };
    }

    public async checkCompatibility(props: {
        runtimeContext: AdapterRuntimeContext;
        config: Config;
    }) {
        for (const plugin of this.plugins.values()) {
            if (plugin.checkCompatibility) {
                await plugin.checkCompatibility(props);
            }
        }
    }

    public async executeInitHooks() {
        for (const plugin of this.plugins.values()) {
            if (plugin.hooks?.init) {
                const res = await plugin.hooks.init();
                if (res.error) {
                    throw new LucidError({
                        scope: plugin.key,
                        message: res.error.message ?? T("plugin_init_error"),
                    });
                }
            }
        }
    }

    public applyRecipes(config: Config): Config {
        let currentConfig = config;
        for (const plugin of this.plugins.values()) {
            if (plugin.recipe) {
                currentConfig = produce(currentConfig, plugin.recipe);
            }
        }
        return currentConfig;
    }

    public setConfig(config: Config) {
        this.config = config;
    }

    public setRuntimeContext(context: AdapterRuntimeContext) {
        this.runtimeContext = context;
    }

    public async executeAfterConfigHooks(config: Config) {
        for (const plugin of this.plugins.values()) {
            if (plugin.hooks?.afterConfig) {
                await plugin.hooks.afterConfig(config);
            }
        }
    }

    public async executeBeforeServerStartHooks() {
        if (!this.config) throw new Error("Config not set");

        const context: LucidPluginLifecycleContext = {
            config: this.config,
            runtimeContext: this.runtimeContext,
        };

        for (const plugin of this.plugins.values()) {
            if (plugin.hooks?.beforeServerStart) {
                await plugin.hooks.beforeServerStart(context);
            }
        }
    }

    public async executeBeforeDestroyHooks() {
        for (const plugin of this.plugins.values()) {
            if (plugin.hooks?.beforeDestroy) {
                await plugin.hooks.beforeDestroy();
            }
        }
    }

    public async registerExtensions(app: Hono<LucidHonoGeneric>) {
        if (!this.config) throw new Error("Config not set");

        const context: LucidPluginLifecycleContext = {
            config: this.config,
            runtimeContext: this.runtimeContext,
        };

        for (const plugin of this.plugins.values()) {
            if (plugin.middleware) {
                for (const mw of plugin.middleware) {
                    await mw(app, context);
                }
            }
            if (plugin.routes) {
                for (const route of plugin.routes) {
                    await route(app, context);
                }
            }
        }
    }

    public getAllPlugins(): LucidPluginManifest[] {
        return Array.from(this.plugins.values());
    }

    public getPlugin(key: string): LucidPluginManifest | undefined {
        return this.plugins.get(key);
    }
}
