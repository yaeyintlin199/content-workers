import { describe, it, expect, vi } from "vitest";
import { createPlugin } from "../src/builder.js";
describe("Plugin SDK", () => {
    describe("createPlugin", () => {
        it("should create a basic plugin", () => {
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .build();
            const manifest = plugin();
            expect(manifest.key).toBe("test-plugin");
            expect(manifest.lucid).toBe(">=0.12.0");
        });
        it("should create a plugin with all metadata", () => {
            const plugin = createPlugin()
                .metadata((metadata) => metadata
                .key("test-plugin")
                .name("Test Plugin")
                .version("1.0.0")
                .description("A test plugin")
                .lucid("^0.12.0"))
                .build();
            const manifest = plugin();
            expect(manifest).toEqual({
                key: "test-plugin",
                name: "Test Plugin",
                version: "1.0.0",
                description: "A test plugin",
                lucid: "^0.12.0",
            });
        });
        it("should create a plugin with a recipe", () => {
            const recipe = vi.fn();
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .recipe(recipe)
                .build();
            const manifest = plugin();
            expect(manifest.recipe).toBe(recipe);
        });
        it("should create a plugin with hooks", () => {
            const initHook = vi.fn();
            const beforeServerStartHook = vi.fn();
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .hooks((hooks) => {
                hooks.init(initHook);
                hooks.beforeServerStart(beforeServerStartHook);
            })
                .build();
            const manifest = plugin();
            expect(manifest.hooks).toBeDefined();
            expect(manifest.hooks?.init).toBe(initHook);
            expect(manifest.hooks?.beforeServerStart).toBe(beforeServerStartHook);
        });
        it("should create a plugin with routes", () => {
            const route1 = vi.fn();
            const route2 = vi.fn();
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .routes((routes) => {
                routes.add(route1);
                routes.add(route2);
            })
                .build();
            const manifest = plugin();
            expect(manifest.routes).toHaveLength(2);
            expect(manifest.routes?.[0]).toBe(route1);
            expect(manifest.routes?.[1]).toBe(route2);
        });
        it("should create a plugin with middleware", () => {
            const middleware1 = vi.fn();
            const middleware2 = vi.fn();
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .middleware((middleware) => {
                middleware.add(middleware1);
                middleware.add(middleware2);
            })
                .build();
            const manifest = plugin();
            expect(manifest.middleware).toHaveLength(2);
            expect(manifest.middleware?.[0]).toBe(middleware1);
            expect(manifest.middleware?.[1]).toBe(middleware2);
        });
        it("should create a plugin with services", () => {
            const service1 = { test: "value1" };
            const service2 = { test: "value2" };
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .services((services) => {
                services.add("service1", service1);
                services.add("service2", service2);
            })
                .build();
            const manifest = plugin();
            expect(manifest.services).toEqual({
                service1,
                service2,
            });
        });
        it("should create a plugin with admin configuration", () => {
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .admin((admin) => {
                admin.entry("/admin/test-plugin");
                admin.css("/admin/test-plugin.css");
                admin.route({
                    key: "dashboard",
                    label: "Dashboard",
                    path: "/dashboard",
                });
                admin.sidebarItem({
                    key: "settings",
                    label: "Settings",
                    route: "/settings",
                });
                admin.settingsPanel({
                    key: "general",
                    label: "General",
                    route: "/general",
                });
            })
                .build();
            const manifest = plugin();
            expect(manifest.admin).toEqual({
                entry: "/admin/test-plugin",
                css: "/admin/test-plugin.css",
                routes: [
                    {
                        key: "dashboard",
                        label: "Dashboard",
                        path: "/dashboard",
                    },
                ],
                sidebarItems: [
                    {
                        key: "settings",
                        label: "Settings",
                        route: "/settings",
                    },
                ],
                settingsPanels: [
                    {
                        key: "general",
                        label: "General",
                        route: "/general",
                    },
                ],
            });
        });
        it("should create a plugin with compatibility checker", () => {
            const checker = vi.fn();
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .checkCompatibility((checkerFn) => {
                checkerFn(checker);
            })
                .build();
            const manifest = plugin();
            expect(manifest.checkCompatibility).toBe(checker);
        });
        it("should support plugin options", () => {
            const recipe = vi.fn();
            const plugin = createPlugin({
                apiKey: "test-key",
            })
                .metadata((metadata) => metadata.key("test-plugin"))
                .recipe(recipe)
                .build();
            const manifest = plugin({ apiKey: "override-key" });
            expect(manifest.recipe).toBe(recipe);
        });
        it("should handle empty arrays and objects correctly", () => {
            const plugin = createPlugin()
                .metadata((metadata) => metadata.key("test-plugin"))
                .build();
            const manifest = plugin();
            // Empty arrays and objects should be undefined
            expect(manifest.routes).toBeUndefined();
            expect(manifest.middleware).toBeUndefined();
            expect(manifest.services).toBeUndefined();
            expect(manifest.admin).toEqual({});
        });
        it("should build fluent API correctly", () => {
            const plugin = createPlugin()
                .metadata((metadata) => {
                metadata.key("test-plugin");
                metadata.name("Test Plugin");
            })
                .recipe(vi.fn())
                .hooks((hooks) => {
                hooks.init(vi.fn());
            })
                .routes((routes) => {
                routes.add(vi.fn());
            })
                .services((services) => {
                services.add("test", {});
            })
                .admin((admin) => {
                admin.entry("/admin/test");
            })
                .build();
            const manifest = plugin();
            expect(manifest.key).toBe("test-plugin");
            expect(manifest.name).toBe("Test Plugin");
            expect(manifest.recipe).toBeDefined();
            expect(manifest.hooks?.init).toBeDefined();
            expect(manifest.routes).toHaveLength(1);
            expect(manifest.services).toBeDefined();
            expect(manifest.admin?.entry).toBe("/admin/test");
        });
        it("should generate valid LucidPluginManifest", () => {
            const plugin = createPlugin()
                .metadata((metadata) => {
                metadata.key("test-plugin");
                metadata.name("Test Plugin");
                metadata.version("1.0.0");
            })
                .recipe(vi.fn())
                .build();
            const manifest = plugin();
            // Validate manifest structure
            expect(typeof manifest.key).toBe("string");
            expect(typeof manifest.lucid).toBe("string");
            expect(typeof manifest.recipe).toBe("function");
            // Validate optional fields
            if (manifest.name)
                expect(typeof manifest.name).toBe("string");
            if (manifest.version)
                expect(typeof manifest.version).toBe("string");
            if (manifest.description)
                expect(typeof manifest.description).toBe("string");
        });
    });
    describe("type safety", () => {
        it("should provide proper TypeScript types", () => {
            // This should compile without errors
            const plugin = createPlugin({
                apiKey: "test-key",
            })
                .metadata((metadata) => {
                metadata.key("typed-plugin");
                metadata.name("Typed Plugin");
            })
                .recipe((draft) => {
                // TypeScript should understand draft is WritableDraft<Config>
                expectTypeOf(draft).toBeObject();
            })
                .hooks((hooks) => {
                hooks.init(async () => {
                    return { success: true, data: undefined };
                });
            })
                .build();
            const manifest = plugin({ apiKey: "new-key", debug: true });
            expect(manifest.key).toBe("typed-plugin");
        });
    });
});
// TypeScript type helper for testing
function expectTypeOf(value) {
    return {
        toBeObject: () => {
            if (typeof value !== "object" || value === null) {
                throw new Error("Expected value to be an object");
            }
        },
    };
}
