import { createStore } from "solid-js/store";

// PluginManifestItem type definition
export interface PluginManifestItem {
    key: string;
    name?: string;
    description?: string;
    version?: string;
    bundleUrl?: string;
    cssUrl?: string;
    sidebarItems?: Array<{
        key: string;
        label: string;
        icon?: string;
        permission?: string;
        route: string;
    }>;
    settingsPanels?: Array<{
        key: string;
        label: string;
        route: string;
    }>;
    routes?: Array<{
        key: string;
        label: string;
        route: string;
        permission?: string;
    }>;
}

export interface PluginStore {
    manifests: PluginManifestItem[];
    loadedPlugins: Set<string>;
    isLoading: boolean;
    error: string | null;
}

export const [pluginStore, setPluginStore] = createStore<PluginStore>({
    manifests: [],
    loadedPlugins: new Set(),
    isLoading: false,
    error: null,
});

export const pluginStoreActions = {
    setManifests: (manifests: PluginManifestItem[]) => {
        setPluginStore("manifests", manifests);
    },

    loadPlugin: (pluginKey: string) => {
        setPluginStore("loadedPlugins", (prev) => {
            const newSet = new Set(prev);
            newSet.add(pluginKey);
            return newSet;
        });
    },

    unloadPlugin: (pluginKey: string) => {
        setPluginStore("loadedPlugins", (prev) => {
            const newSet = new Set(prev);
            newSet.delete(pluginKey);
            return newSet;
        });
    },

    setLoading: (isLoading: boolean) => {
        setPluginStore("isLoading", isLoading);
    },

    setError: (error: string | null) => {
        setPluginStore("error", error);
    },

    clearError: () => {
        setPluginStore("error", null);
    },

    isPluginLoaded: (pluginKey: string): boolean => {
        return pluginStore.loadedPlugins.has(pluginKey);
    },

    getPluginManifest: (pluginKey: string): PluginManifestItem | undefined => {
        return pluginStore.manifests.find((m) => m.key === pluginKey);
    },

    getAllRoutes: () => {
        const routes: Array<{
            key: string;
            label: string;
            route: string;
            permission?: string;
            pluginKey: string;
        }> = [];

        for (const manifest of pluginStore.manifests) {
            if (manifest.routes) {
                for (const route of manifest.routes) {
                    routes.push({
                        ...route,
                        pluginKey: manifest.key,
                    });
                }
            }
        }

        return routes;
    },

    getAllSidebarItems: () => {
        const sidebarItems: Array<{
            key: string;
            label: string;
            icon?: string;
            permission?: string;
            route: string;
            pluginKey: string;
        }> = [];

        for (const manifest of pluginStore.manifests) {
            if (manifest.sidebarItems) {
                for (const item of manifest.sidebarItems) {
                    sidebarItems.push({
                        ...item,
                        pluginKey: manifest.key,
                    });
                }
            }
        }

        return sidebarItems;
    },
};