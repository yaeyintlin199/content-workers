import { createMemo } from "solid-js";
import useGetSettings from "./useGetSettings";
import { loadPluginManifest } from "../../../utils/plugin-manifest";
import type { PluginManifestItem } from "../../../store/pluginStore";

/**
 * Hook to get plugin manifests from settings
 */
const useGetPluginManifests = (params?: {
    enabled?: () => boolean;
    onSuccess?: (manifests: PluginManifestItem[]) => void;
}) => {
    const settingsQuery = useGetSettings({
        enabled: params?.enabled,
    });

    const pluginManifests = createMemo(() => {
        if (settingsQuery.data?.data?.plugins?.manifests) {
            return settingsQuery.data.data.plugins.manifests;
        }
        return [];
    });

    // Auto-load plugin manifest when settings are loaded
    createMemo(() => {
        if (settingsQuery.data && pluginManifests().length > 0) {
            params?.onSuccess?.(pluginManifests());
        }
    });

    return {
        data: pluginManifests(),
        isLoading: settingsQuery.isLoading,
        error: settingsQuery.error,
        refetch: settingsQuery.refetch,
    };
};

export default useGetPluginManifests;