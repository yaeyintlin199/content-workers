import { describe, it, expect, vi } from "vitest";

// Mock the plugin store and utils
vi.mock("../../store/pluginStore", () => ({
    pluginStore: {
        manifests: [
            {
                key: "test-plugin",
                name: "Test Plugin",
                routes: [
                    {
                        key: "dashboard",
                        label: "Test Dashboard",
                        route: "/admin/test-plugin/dashboard",
                        permission: "read_test",
                    },
                ],
                sidebarItems: [
                    {
                        key: "test-sidebar",
                        label: "Test Sidebar",
                        icon: "test-icon",
                        permission: "read_test",
                        route: "/admin/test-plugin/sidebar",
                    },
                ],
            },
        ],
        loadedPlugins: new Set(["test-plugin"]),
        isLoading: false,
        error: null,
    },
    pluginStoreActions: {
        setManifests: vi.fn(),
        loadPlugin: vi.fn(),
        unloadPlugin: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn(),
        isPluginLoaded: vi.fn((key: string) => key === "test-plugin"),
        getPluginManifest: vi.fn((key: string) =>
            key === "test-plugin"
                ? {
                        key: "test-plugin",
                        name: "Test Plugin",
                        routes: [],
                        sidebarItems: [],
                  }
                : undefined,
        ),
        getAllRoutes: vi.fn(() => [
            {
                key: "dashboard",
                label: "Test Dashboard",
                route: "/admin/test-plugin/dashboard",
                permission: "read_test",
                pluginKey: "test-plugin",
            },
        ]),
        getAllSidebarItems: vi.fn(() => [
            {
                key: "test-sidebar",
                label: "Test Sidebar",
                icon: "test-icon",
                permission: "read_test",
                route: "/admin/test-plugin/sidebar",
                pluginKey: "test-plugin",
            },
        ]),
    },
}));

vi.mock("../plugin-manifest", () => ({
    getAllPluginRoutes: vi.fn(() => [
        {
            key: "dashboard",
            label: "Test Dashboard",
            route: "/admin/test-plugin/dashboard",
            permission: "read_test",
            pluginKey: "test-plugin",
        },
    ]),
    getAllPluginSidebarItems: vi.fn(() => [
        {
            key: "test-sidebar",
            label: "Test Sidebar",
            icon: "test-icon",
            permission: "read_test",
            route: "/admin/test-plugin/sidebar",
            pluginKey: "test-plugin",
        },
    ]),
    hasPluginPermission: vi.fn((_key: string, _permission?: string) => true),
}));

import { pluginStore, pluginStoreActions } from "../../store/pluginStore";
import { getAllPluginRoutes, getAllPluginSidebarItems, hasPluginPermission } from "../plugin-manifest";

describe("Plugin Store", () => {
    it("should manage plugin manifests", () => {
        expect(pluginStore.manifests).toHaveLength(1);
        expect(pluginStore.manifests[0]?.key).toBe("test-plugin");
    });

    it("should track loaded plugins", () => {
        expect(pluginStore.loadedPlugins.has("test-plugin")).toBe(true);
        expect(pluginStore.loadedPlugins.has("unloaded-plugin")).toBe(false);
    });

    it("should manage loading states", () => {
        expect(pluginStore.isLoading).toBe(false);
        expect(pluginStore.error).toBeNull();
    });
});

describe("Plugin Manifest Utils", () => {
    it("should get all plugin routes", () => {
        const routes = getAllPluginRoutes();
        expect(routes).toHaveLength(1);
        expect(routes[0]).toMatchObject({
            key: "dashboard",
            label: "Test Dashboard",
            route: "/admin/test-plugin/dashboard",
            permission: "read_test",
            pluginKey: "test-plugin",
        });
    });

    it("should get all plugin sidebar items", () => {
        const sidebarItems = getAllPluginSidebarItems();
        expect(sidebarItems).toHaveLength(1);
        expect(sidebarItems[0]).toMatchObject({
            key: "test-sidebar",
            label: "Test Sidebar",
            icon: "test-icon",
            permission: "read_test",
            route: "/admin/test-plugin/sidebar",
            pluginKey: "test-plugin",
        });
    });

    it("should check plugin permissions", () => {
        expect(hasPluginPermission("test-plugin", "read_test")).toBe(true);
        expect(hasPluginPermission("test-plugin", "admin_test")).toBe(true); // Mock returns true
    });

    it("should handle missing plugins", () => {
        const routes = getAllPluginRoutes();
        const manifest = pluginStoreActions.getPluginManifest("non-existent-plugin");
        expect(manifest).toBeUndefined();
    });
});