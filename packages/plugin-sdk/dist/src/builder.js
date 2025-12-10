/**
 * Creates a new plugin builder.
 */
export function createPlugin(pluginOptions) {
    const builder = new PluginBuilderImpl(pluginOptions);
    return builder;
}
/**
 * Internal implementation of the plugin builder.
 */
class PluginBuilderImpl {
    pluginOptions;
    metadata = {
        key: "plugin",
        lucid: ">=0.12.0",
    };
    hooks = {};
    routes = [];
    middleware = [];
    services = {};
    admin = {};
    recipe;
    compatibilityChecker;
    constructor(pluginOptions) {
        this.pluginOptions = pluginOptions;
    }
    metadata(cb) {
        const metadataBuilder = this.createMetadataBuilder();
        cb(metadataBuilder);
        return this;
    }
    recipe(recipe) {
        this.recipe = recipe;
        return this;
    }
    hooks(cb) {
        const configBuilder = this.createHooksBuilder();
        cb(configBuilder);
        return this;
    }
    routes(cb) {
        const configBuilder = this.createRoutesBuilder();
        cb(configBuilder);
        return this;
    }
    middleware(cb) {
        const configBuilder = this.createMiddlewareBuilder();
        cb(configBuilder);
        return this;
    }
    services(cb) {
        const configBuilder = this.createServicesBuilder();
        cb(configBuilder);
        return this;
    }
    admin(cb) {
        const configBuilder = this.createAdminBuilder();
        cb(configBuilder);
        return this;
    }
    checkCompatibility(cb) {
        const checkerFn = (checker) => {
            this.compatibilityChecker = checker;
        };
        cb(checkerFn);
        return this;
    }
    build() {
        const plugin = () => {
            const hooks = Object.keys(this.hooks).length > 0 ? this.hooks : undefined;
            const routes = this.routes.length > 0 ? this.routes : undefined;
            const middleware = this.middleware.length > 0 ? this.middleware : undefined;
            const services = Object.keys(this.services).length > 0 ? this.services : undefined;
            const admin = this.hasAdminConfiguration() ? this.admin : {};
            return {
                key: this.metadata.key,
                name: this.metadata.name,
                version: this.metadata.version,
                description: this.metadata.description,
                lucid: this.metadata.lucid,
                recipe: this.recipe,
                hooks,
                routes,
                middleware,
                services,
                admin,
                checkCompatibility: this.compatibilityChecker,
            };
        };
        return plugin;
    }
    createMetadataBuilder() {
        const metadataBuilder = {
            key: (key) => {
                this.metadata.key = key;
                return metadataBuilder;
            },
            name: (name) => {
                this.metadata.name = name;
                return metadataBuilder;
            },
            version: (version) => {
                this.metadata.version = version;
                return metadataBuilder;
            },
            description: (description) => {
                this.metadata.description = description;
                return metadataBuilder;
            },
            lucid: (lucidVersion) => {
                this.metadata.lucid = lucidVersion;
                return metadataBuilder;
            },
        };
        return metadataBuilder;
    }
    createHooksBuilder() {
        const hooksBuilder = {
            init: (init) => {
                this.hooks.init = init;
                return hooksBuilder;
            },
            afterConfig: (afterConfig) => {
                this.hooks.afterConfig = afterConfig;
                return hooksBuilder;
            },
            beforeServerStart: (beforeServerStart) => {
                this.hooks.beforeServerStart = beforeServerStart;
                return hooksBuilder;
            },
            beforeDestroy: (beforeDestroy) => {
                this.hooks.beforeDestroy = beforeDestroy;
                return hooksBuilder;
            },
            build: (build) => {
                this.hooks.build = build;
                return hooksBuilder;
            },
        };
        return hooksBuilder;
    }
    createRoutesBuilder() {
        const routesBuilder = {
            add: (route) => {
                this.routes.push(route);
                return routesBuilder;
            },
        };
        return routesBuilder;
    }
    createMiddlewareBuilder() {
        const middlewareBuilder = {
            add: (middleware) => {
                this.middleware.push(middleware);
                return middlewareBuilder;
            },
        };
        return middlewareBuilder;
    }
    createServicesBuilder() {
        const servicesBuilder = {
            add: (name, service) => {
                this.services[name] = service;
                return servicesBuilder;
            },
        };
        return servicesBuilder;
    }
    createAdminBuilder() {
        const adminBuilder = {
            entry: (entry) => {
                this.admin.entry = entry;
                return adminBuilder;
            },
            css: (css) => {
                this.admin.css = css;
                return adminBuilder;
            },
            route: (options) => {
                if (!this.admin.routes)
                    this.admin.routes = [];
                this.admin.routes.push(options);
                return adminBuilder;
            },
            sidebarItem: (options) => {
                if (!this.admin.sidebarItems)
                    this.admin.sidebarItems = [];
                this.admin.sidebarItems.push(options);
                return adminBuilder;
            },
            settingsPanel: (options) => {
                if (!this.admin.settingsPanels)
                    this.admin.settingsPanels = [];
                this.admin.settingsPanels.push(options);
                return adminBuilder;
            },
        };
        return adminBuilder;
    }
    hasAdminConfiguration() {
        return Boolean(this.admin.entry ||
            this.admin.css ||
            this.admin.routes?.length ||
            this.admin.sidebarItems?.length ||
            this.admin.settingsPanels?.length);
    }
}
