import { onMount, createEffect, type Component } from "solid-js";
import { loadPluginManifest } from "../utils/plugin-manifest";
import { pluginStoreActions } from "../store/pluginStore";
import api from "../services/api";

/**
 * PluginLoader initializes plugin system when the app starts
 */
const PluginLoader: Component = () => {
    const pluginManifestsQuery = api.settings.useGetPluginManifests({
        enabled: () => true,
        onSuccess: (manifests) => {
            console.log(`Loaded ${manifests.length} plugin manifests`);
        },
    });

    onMount(() => {
        // Auto-load plugin manifests if not already loaded by the API hook
        if (pluginManifestsQuery.data.length === 0) {
            loadPluginManifest()
                .then((manifests) => {
                    console.log(`Auto-loaded ${manifests.length} plugin manifests`);
                })
                .catch((error) => {
                    console.warn("Failed to auto-load plugin manifests:", error);
                });
        }
    });

    createEffect(() => {
        if (pluginManifestsQuery.error) {
            console.warn("Plugin manifest loading error:", pluginManifestsQuery.error);
        }
    });

    return null; // This component doesn't render anything
};

export default PluginLoader;