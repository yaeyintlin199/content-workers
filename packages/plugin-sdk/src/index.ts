// Re-export types from @lucidcms/core for plugin development
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
} from "@lucidcms/core/libs/plugins/types.js";
export type { LucidHonoGeneric } from "@lucidcms/core/types/hono.js";

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