import { WritableDraft } from "immer";
import type { Hono } from "hono";
import type { 
	LucidPlugin, 
	LucidPluginManifest, 
	LucidPluginLifecycleContext, 
	LucidPluginHooks, 
	LucidPluginRecipe,
	AdapterRuntimeContext 
} from "@lucidcms/core/libs/plugins/types.js";
import type { Config } from "@lucidcms/core/types/config.js";
import type { ServiceResponse } from "@lucidcms/core/utils/services/types.js";
import type { LucidHonoGeneric } from "@lucidcms/core/types/hono.js";

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
		artifacts?: Array<
			| {
					type: "file";
					path: string;
					content: string;
					encoding?: BufferEncoding;
			  }
			| {
					type: "compile";
					compiler: string;
					inputPath: string;
					outputPath: string;
					options?: Record<string, unknown>;
			  }
			| {
					type: "custom";
					data: unknown;
			  }
		>;
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
export function createPlugin<Options = undefined>(pluginOptions?: Options): PluginBuilder<Options> {
	const builder = new PluginBuilderImpl<Options>(pluginOptions);
	return builder;
}

/**
 * Internal implementation of the plugin builder.
 */
class PluginBuilderImpl<Options = undefined> implements PluginBuilder<Options> {
	private metadata: PluginMetadata = {
		key: "plugin",
		lucid: ">=0.12.0",
	};
	private hooks: LucidPluginHooks = {};
	private routes: Array<(app: Hono<LucidHonoGeneric>, context: LucidPluginLifecycleContext) => Promise<void>> = [];
	private middleware: Array<(app: Hono<LucidHonoGeneric>, context: LucidPluginLifecycleContext) => Promise<void>> = [];
	private services: Record<string, unknown> = {};
	private admin: LucidPluginManifest["admin"] = {};
	private recipe?: LucidPluginRecipe;
	private compatibilityChecker?: (props: {
		runtimeContext: AdapterRuntimeContext;
		config: Config;
	}) => void | Promise<void>;

	constructor(private pluginOptions?: Options) {}

	metadata(cb: (builder: PluginMetadataConfigurable) => void): PluginBuilder<Options> {
		const metadataBuilder = this.createMetadataBuilder();
		cb(metadataBuilder);
		return this;
	}

	recipe(recipe: LucidPluginRecipe): PluginBuilder<Options> {
		this.recipe = recipe;
		return this;
	}

	hooks(cb: (builder: PluginHooksConfigurable) => void): PluginBuilder<Options> {
		const configBuilder = this.createHooksBuilder();
		cb(configBuilder);
		return this;
	}

	routes(cb: (builder: PluginRoutesConfigurable) => void): PluginBuilder<Options> {
		const configBuilder = this.createRoutesBuilder();
		cb(configBuilder);
		return this;
	}

	middleware(cb: (builder: PluginMiddlewareConfigurable) => void): PluginBuilder<Options> {
		const configBuilder = this.createMiddlewareBuilder();
		cb(configBuilder);
		return this;
	}

	services(cb: (builder: PluginServicesConfigurable) => void): PluginBuilder<Options> {
		const configBuilder = this.createServicesBuilder();
		cb(configBuilder);
		return this;
	}

	admin(cb: (builder: PluginAdminConfigurable) => void): PluginBuilder<Options> {
		const configBuilder = this.createAdminBuilder();
		cb(configBuilder);
		return this;
	}

	checkCompatibility(cb: (checker: PluginCompatibilityChecker) => void): PluginBuilder<Options> {
		const checkerFn: PluginCompatibilityChecker = (checker) => {
			this.compatibilityChecker = checker;
		};
		cb(checkerFn);
		return this;
	}

	build(): LucidPlugin<Options> {
		const plugin: LucidPlugin<Options> = () => {
			return {
				key: this.metadata.key,
				name: this.metadata.name,
				version: this.metadata.version,
				description: this.metadata.description,
				lucid: this.metadata.lucid,
				recipe: this.recipe,
				hooks: Object.keys(this.hooks).length > 0 ? this.hooks : undefined,
				routes: this.routes.length > 0 ? this.routes : undefined,
				middleware: this.middleware.length > 0 ? this.middleware : undefined,
				services: Object.keys(this.services).length > 0 ? this.services : undefined,
				admin: Object.keys(this.admin).length > 0 || this.admin.routes?.length || this.admin.sidebarItems?.length || this.admin.settingsPanels?.length ? this.admin : undefined,
				checkCompatibility: this.compatibilityChecker,
			};
		};

		return plugin;
	}

	private createMetadataBuilder(): PluginMetadataConfigurable {
		return {
			key: (key: string) => {
				this.metadata.key = key;
				return this;
			},
			name: (name: string) => {
				this.metadata.name = name;
				return this;
			},
			version: (version: string) => {
				this.metadata.version = version;
				return this;
			},
			description: (description: string) => {
				this.metadata.description = description;
				return this;
			},
			lucid: (lucidVersion: string) => {
				this.metadata.lucid = lucidVersion;
				return this;
			},
		};
	}

	private createHooksBuilder(): PluginHooksConfigurable {
		return {
			init: (init) => {
				this.hooks.init = init;
				return this;
			},
			afterConfig: (afterConfig) => {
				this.hooks.afterConfig = afterConfig;
				return this;
			},
			beforeServerStart: (beforeServerStart) => {
				this.hooks.beforeServerStart = beforeServerStart;
				return this;
			},
			beforeDestroy: (beforeDestroy) => {
				this.hooks.beforeDestroy = beforeDestroy;
				return this;
			},
			build: (build) => {
				this.hooks.build = build;
				return this;
			},
		};
	}

	private createRoutesBuilder(): PluginRoutesConfigurable {
		return {
			add: (route) => {
				this.routes.push(route);
				return this;
			},
		};
	}

	private createMiddlewareBuilder(): PluginMiddlewareConfigurable {
		return {
			add: (middleware) => {
				this.middleware.push(middleware);
				return this;
			},
		};
	}

	private createServicesBuilder(): PluginServicesConfigurable {
		return {
			add: <T = unknown>(name: string, service: T) => {
				this.services[name] = service;
				return this;
			},
		};
	}

	private createAdminBuilder(): PluginAdminConfigurable {
		if (!this.admin) {
			this.admin = {};
		}

		return {
			entry: (entry: string) => {
				if (!this.admin) this.admin = {};
				this.admin.entry = entry;
				return this;
			},
			css: (css: string) => {
				if (!this.admin) this.admin = {};
				this.admin.css = css;
				return this;
			},
			route: (options: PluginAdminRoute) => {
				if (!this.admin) this.admin = {};
				if (!this.admin.routes) this.admin.routes = [];
				this.admin.routes.push(options);
				return this;
			},
			sidebarItem: (options: PluginAdminSidebarItem) => {
				if (!this.admin) this.admin = {};
				if (!this.admin.sidebarItems) this.admin.sidebarItems = [];
				this.admin.sidebarItems.push(options);
				return this;
			},
			settingsPanel: (options: PluginAdminSettingsPanel) => {
				if (!this.admin) this.admin = {};
				if (!this.admin.settingsPanels) this.admin.settingsPanels = [];
				this.admin.settingsPanels.push(options);
				return this;
			},
		};
	}
}