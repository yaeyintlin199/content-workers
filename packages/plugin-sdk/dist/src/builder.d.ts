import type { Hono } from "hono";
import type { LucidPlugin, LucidPluginLifecycleContext, LucidPluginRecipe, AdapterRuntimeContext, Config, ServiceResponse, LucidHonoGeneric } from "@content-workers/core/types.js";
/**
 * Simple plugin builder for creating Lucid plugins with a fluent API.
 */
export interface PluginBuilder<Options = undefined> {
    /**
     * Sets the plugin metadata.
     */
    metadata(cb: (builder: PluginMetadataConfigurable) => void): PluginBuilder<Options>;
    /**
     * Adds a backend recipe to modify the Lucid config.
     */
    recipe(recipe: LucidPluginRecipe): PluginBuilder<Options>;
    /**
     * Adds lifecycle hooks for the plugin.
     */
    hooks(cb: (builder: PluginHooksConfigurable) => void): PluginBuilder<Options>;
    /**
     * Adds backend routes to the plugin.
     */
    routes(cb: (builder: PluginRoutesConfigurable) => void): PluginBuilder<Options>;
    /**
     * Adds backend middleware to the plugin.
     */
    middleware(cb: (builder: PluginMiddlewareConfigurable) => void): PluginBuilder<Options>;
    /**
     * Adds services to the plugin.
     */
    services(cb: (builder: PluginServicesConfigurable) => void): PluginBuilder<Options>;
    /**
     * Adds admin configuration including routes, sidebar items, and settings panels.
     */
    admin(cb: (builder: PluginAdminConfigurable) => void): PluginBuilder<Options>;
    /**
     * Adds a compatibility checker.
     */
    checkCompatibility(cb: (checker: PluginCompatibilityChecker) => void): PluginBuilder<Options>;
    /**
     * Builds and returns the final plugin.
     */
    build(): LucidPlugin<Options>;
}
/**
 * Plugin metadata configuration.
 */
export interface PluginMetadata {
    key: string;
    name?: string;
    version?: string;
    description?: string;
    lucid: string;
}
/**
 * Configurable plugin metadata interface.
 */
export interface PluginMetadataConfigurable {
    /**
     * Sets the unique key of the plugin.
     */
    key(key: string): this;
    /**
     * Sets the name of the plugin.
     */
    name(name: string): this;
    /**
     * Sets the version of the plugin.
     */
    version(version: string): this;
    /**
     * Sets the description of the plugin.
     */
    description(description: string): this;
    /**
     * Sets the Lucid CMS semver range that the plugin is compatible with.
     */
    lucid(lucidVersion: string): this;
}
/**
 * Configurable plugin hooks interface.
 */
export interface PluginHooksConfigurable {
    /**
     * Called when the plugin is initialized within the `processConfig` function.
     */
    init(init: () => ServiceResponse<undefined> | Promise<ServiceResponse<undefined>>): this;
    /**
     * Called after the config has been processed and merged.
     */
    afterConfig(afterConfig: (config: Config) => void | Promise<void>): this;
    /**
     * Called before the server starts.
     */
    beforeServerStart(beforeServerStart: (context: LucidPluginLifecycleContext) => void | Promise<void>): this;
    /**
     * Called before the application is destroyed/stopped.
     */
    beforeDestroy(beforeDestroy: () => void | Promise<void>): this;
    /**
     * Called when the CLI build command is ran.
     */
    build(build: (props: {
        paths: {
            configPath: string;
            outputPath: string;
            outputRelativeConfigPath: string;
        };
    }) => ServiceResponse<{
        artifacts?: Array<{
            type: "file";
            path: string;
            content: string;
            encoding?: BufferEncoding;
        } | {
            type: "compile";
            compiler: string;
            inputPath: string;
            outputPath: string;
            options?: Record<string, unknown>;
        } | {
            type: "custom";
            data: unknown;
        }>;
    }>): this;
}
/**
 * Configurable plugin routes interface.
 */
export interface PluginRoutesConfigurable {
    /**
     * Adds a backend route.
     */
    add(route: (app: Hono<LucidHonoGeneric>, context: LucidPluginLifecycleContext) => Promise<void>): this;
}
/**
 * Configurable plugin middleware interface.
 */
export interface PluginMiddlewareConfigurable {
    /**
     * Adds backend middleware.
     */
    add(middleware: (app: Hono<LucidHonoGeneric>, context: LucidPluginLifecycleContext) => Promise<void>): this;
}
/**
 * Configurable plugin services interface.
 */
export interface PluginServicesConfigurable {
    /**
     * Adds a service.
     */
    add<T = unknown>(name: string, service: T): this;
}
/**
 * Configurable plugin admin interface.
 */
export interface PluginAdminConfigurable {
    /**
     * Sets the entry point for the plugin.
     */
    entry(entry: string): this;
    /**
     * Sets the CSS for the plugin.
     */
    css(css: string): this;
    /**
     * Adds an admin route.
     */
    route(options: PluginAdminRoute): this;
    /**
     * Adds a sidebar item.
     */
    sidebarItem(options: PluginAdminSidebarItem): this;
    /**
     * Adds a settings panel.
     */
    settingsPanel(options: PluginAdminSettingsPanel): this;
}
/**
 * Admin route configuration.
 */
export interface PluginAdminRoute {
    key: string;
    label: string;
    path: string;
    permission?: string;
}
/**
 * Admin sidebar item configuration.
 */
export interface PluginAdminSidebarItem {
    key: string;
    label: string;
    icon?: string;
    permission?: string;
    route: string;
}
/**
 * Admin settings panel configuration.
 */
export interface PluginAdminSettingsPanel {
    key: string;
    label: string;
    route: string;
}
/**
 * Plugin compatibility checker.
 */
export interface PluginCompatibilityChecker {
    (checker: (props: {
        runtimeContext: AdapterRuntimeContext;
        config: Config;
    }) => void | Promise<void>): void;
}
/**
 * Creates a new plugin builder.
 */
export declare function createPlugin<Options = undefined>(pluginOptions?: Options): PluginBuilder<Options>;
