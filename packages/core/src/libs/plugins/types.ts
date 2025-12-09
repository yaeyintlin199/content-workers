import type { WritableDraft } from "immer";
import type { ServiceResponse } from "../../utils/services/types.js";
import type { Config } from "../../types/config.js";
import type { Hono } from "hono";
import type { LucidHonoGeneric } from "../../types/hono.js";
import type {
	AdapterRuntimeContext,
	RuntimeBuildArtifactCompile,
	RuntimeBuildArtifactCustom,
	RuntimeBuildArtifactFile,
} from "../runtime-adapter/types.js";

export type LucidPluginBuildHookResult = {
	artifacts?: Array<
		| RuntimeBuildArtifactFile
		| RuntimeBuildArtifactCompile
		| RuntimeBuildArtifactCustom
	>;
};

export type LucidPluginHookInit = () =>
	| ServiceResponse<undefined>
	| Promise<ServiceResponse<undefined>>;
export type LucidPluginHookBuild = (props: {
	paths: {
		configPath: string;
		outputPath: string;
		outputRelativeConfigPath: string;
	};
}) => ServiceResponse<LucidPluginBuildHookResult>;

export type LucidPluginLifecycleContext = {
	config: Config;
	runtimeContext?: AdapterRuntimeContext;
};

export type LucidPluginHooks = {
	/**
	 * This hook is called when the plugin is initialized within the `processConfig` function.
	 */
	init?: LucidPluginHookInit;
	/**
	 * Called after the config has been processed and merged.
	 */
	afterConfig?: (config: Config) => void | Promise<void>;
	/**
	 * Called before the server starts.
	 */
	beforeServerStart?: (
		context: LucidPluginLifecycleContext,
	) => void | Promise<void>;
	/**
	 * Called before the application is destroyed/stopped.
	 */
	beforeDestroy?: () => void | Promise<void>;
	/**
	 * This hook is called when the CLI build command is ran.
	 *
	 * Its artifacts are collected, processed and potentially passed to the runtime adapter based on the type.
	 */
	build?: LucidPluginHookBuild;
};

export type LucidPluginRecipe = (draft: WritableDraft<Config>) => void;

export type LucidPluginManifest = {
	/**
	 * The unique key of the plugin.
	 */
	key: string;
	/**
	 * The name of the plugin.
	 */
	name?: string;
	/**
	 * The version of the plugin.
	 */
	version?: string;
	/**
	 * The description of the plugin.
	 */
	description?: string;
	/**
	 * The Lucid CMS semver range that the plugin is compatible with.
	 */
	lucid: string;
	/**
	 * The hooks that the plugin can register.
	 */
	hooks?: LucidPluginHooks;
	/**
	 * Backend routes extension.
	 */
	routes?: Array<
		(
			app: Hono<LucidHonoGeneric>,
			context: LucidPluginLifecycleContext,
		) => Promise<void>
	>;
	/**
	 * Backend middleware extension.
	 */
	middleware?: Array<
		(
			app: Hono<LucidHonoGeneric>,
			context: LucidPluginLifecycleContext,
		) => Promise<void>
	>;
	/**
	 * Backend services extension.
	 */
	services?: Record<string, unknown>;
	/**
	 * Admin assets and configuration.
	 */
	admin?: {
		entry?: string;
		css?: string;
	};
	/**
	 * Can be used to check if the plugin is compatible with the current runtime context and state of the config.
	 *
	 * If the plugin is not compatible, you can throw either a LucidError or standard Error.
	 */
	checkCompatibility?: (props: {
		runtimeContext: AdapterRuntimeContext;
		config: Config;
	}) => void | Promise<void>;
	/**
	 * The recipe function where you can mutate the config.
	 */
	recipe?: LucidPluginRecipe;
};

// Alias for backward compatibility if needed, or just to match the old type name in other files for now
export type LucidPluginResponse = LucidPluginManifest;

export type LucidPlugin<T = undefined> = (
	pluginOptions?: T,
) => LucidPluginManifest;
