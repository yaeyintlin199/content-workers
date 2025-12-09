import type { PluginManifestItem } from "../store/pluginStore";
import { pluginStoreActions } from "../store/pluginStore";

/**
 * Load plugin manifest from the backend
 */
export const loadPluginManifest = async (): Promise<PluginManifestItem[]> => {
    try {
        pluginStoreActions.setLoading(true);
        pluginStoreActions.clearError();

        const response = await fetch("/api/v1/settings");
        if (!response.ok) {
            throw new Error(`Failed to load plugin manifest: ${response.statusText}`);
        }

        const data = await response.json();
        const manifests: PluginManifestItem[] = data.data?.plugins?.manifests || [];

        pluginStoreActions.setManifests(manifests);
        return manifests;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error loading plugin manifest";
        pluginStoreActions.setError(errorMessage);
        throw error;
    } finally {
        pluginStoreActions.setLoading(false);
    }
};

/**
 * Load a specific plugin by dynamically importing its bundle
 */
export const loadPluginBundle = async <T = unknown>(pluginKey: string): Promise<T> => {
    const manifest = pluginStoreActions.getPluginManifest(pluginKey);
    if (!manifest?.bundleUrl) {
        throw new Error(`No bundle URL found for plugin: ${pluginKey}`);
    }

    try {
        // Dynamically import the plugin bundle
        const module = (await import(/* @vite-ignore */ manifest.bundleUrl)) as T;
        pluginStoreActions.loadPlugin(pluginKey);
        return module;
    } catch (error) {
        console.error(`Failed to load plugin bundle for ${pluginKey}:`, error);
        throw error;
    }
};

/**
 * Load plugin CSS if available
 */
export const loadPluginStyles = (pluginKey: string): void => {
    const manifest = pluginStoreActions.getPluginManifest(pluginKey);
    if (!manifest?.cssUrl) return;

    // Check if styles are already loaded
    const existingLink = document.querySelector(`link[data-plugin="${pluginKey}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = manifest.cssUrl;
    link.setAttribute("data-plugin", pluginKey);
    document.head.appendChild(link);
};

/**
 * Unload plugin styles
 */
export const unloadPluginStyles = (pluginKey: string): void => {
    const link = document.querySelector(`link[data-plugin="${pluginKey}"]`);
    if (link) {
        link.remove();
    }
};

/**
 * Get all plugin routes for router registration
 */
export const getAllPluginRoutes = () => {
    return pluginStoreActions.getAllRoutes();
};

/**
 * Get all plugin sidebar items
 */
export const getAllPluginSidebarItems = () => {
    return pluginStoreActions.getAllSidebarItems();
};

/**
 * Check if plugin has required permissions
 */
export const hasPluginPermission = (pluginKey: string, requiredPermission?: string): boolean => {
    if (!requiredPermission) return true;

    // This would integrate with your permissions system
    // For now, return true - you'd implement actual permission checking here
    return true;
};