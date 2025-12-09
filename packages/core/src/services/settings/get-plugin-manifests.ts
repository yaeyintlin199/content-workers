import type { ServiceFn } from "../../utils/services/types.js";
import type { PluginManifestItem } from "../../types/response.js";
import { PluginManager } from "../../libs/plugins/plugin-manager.js";

/**
 * Generate plugin manifests for the admin UI
 */
const getPluginManifests: ServiceFn<[PluginManager], PluginManifestItem[]> = async (
	_context,
	pluginManager,
) => {
	const manifests: PluginManifestItem[] = [];

	for (const plugin of pluginManager.getAllPlugins()) {
		const manifest: PluginManifestItem = {
			key: plugin.key,
			name: plugin.name,
			description: plugin.description,
			version: plugin.version,
		};

		// Add admin bundle URLs if available
		if (plugin.admin) {
			if (plugin.admin.entry) {
				manifest.bundleUrl = `/admin/plugins/${plugin.key}/chunk.js`;
			}
			if (plugin.admin.css) {
				manifest.cssUrl = `/admin/plugins/${plugin.key}/styles.css`;
			}
		}

		// Generate routes from plugin admin configuration
		if (plugin.admin?.routes) {
			manifest.routes = plugin.admin.routes.map((route) => ({
				key: route.key,
				label: route.label,
				route: route.path,
				permission: route.permission,
			}));
		}

		// Generate sidebar items
		if (plugin.admin?.sidebarItems) {
			manifest.sidebarItems = plugin.admin.sidebarItems;
		}

		// Generate settings panels
		if (plugin.admin?.settingsPanels) {
			manifest.settingsPanels = plugin.admin.settingsPanels;
		}

		manifests.push(manifest);
	}

	return {
		error: undefined,
		data: manifests,
	};
};

export default getPluginManifests;