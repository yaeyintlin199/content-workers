import type { LucidPlugin } from "@content-workers/core/types";

interface TestPluginOptions {
	name?: string;
	description?: string;
}

const testPlugin: LucidPlugin<TestPluginOptions> = (options = {}) => {
	return {
		key: "test-admin-plugin",
		lucid: "^1.0.0",
		name: options.name || "Test Admin Plugin",
		description: options.description || "A test plugin for admin functionality",
		version: "1.0.0",
		admin: {
			// Routes that this plugin provides
			routes: [
				{
					key: "test-dashboard",
					label: "Test Dashboard",
					path: "/test-plugin/dashboard",
					permission: "read_test_plugin",
				},
				{
					key: "test-settings",
					label: "Test Settings",
					path: "/test-plugin/settings",
					permission: "manage_test_plugin",
				},
			],
			// Sidebar navigation items
			sidebarItems: [
				{
					key: "test-plugin-menu",
					label: "Test Plugin",
					icon: "test-icon",
					permission: "read_test_plugin",
					route: "/test-plugin/dashboard",
				},
			],
			// Settings panels
			settingsPanels: [
				{
					key: "test-config",
					label: "Test Configuration",
					route: "/test-plugin/settings",
				},
			],
		},
		// Hooks (optional)
		hooks: {
			init: () => ({
				error: undefined,
				data: undefined,
			}),
		},
	};
};

export { testPlugin };