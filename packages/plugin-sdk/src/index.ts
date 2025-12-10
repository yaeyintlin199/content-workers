// Re-export types from @content-workers/core for plugin development
export type {
    LucidPlugin,
    LucidPluginManifest,
    LucidPluginLifecycleContext,
    LucidPluginHooks,
    LucidPluginRecipe,
    Config,
    ServiceResponse,
    AdapterRuntimeContext,
    EmailAdapterInstance,
    LucidHonoGeneric,
} from "@content-workers/core/types.js";

// Plugin builder API
export {
    createPlugin,
    type PluginBuilder,
    type PluginMetadata,
    type PluginMetadataConfigurable,
    type PluginHooksConfigurable,
    type PluginRoutesConfigurable,
    type PluginMiddlewareConfigurable,
    type PluginServicesConfigurable,
    type PluginAdminConfigurable,
    type PluginAdminRoute,
    type PluginAdminSidebarItem,
    type PluginAdminSettingsPanel,
    type PluginCompatibilityChecker,
} from "./builder.js";