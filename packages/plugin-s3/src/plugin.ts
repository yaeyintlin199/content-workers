import { createPlugin } from "@content-workers/plugin-sdk";
import s3MediaAdapter from "./adapter.js";
import { LUCID_VERSION, PLUGIN_KEY } from "./constants.js";
import type { PluginOptions } from "./types/types.js";

// Create a closure to capture the plugin options
const createPluginInstance = (pluginOptions: PluginOptions) => {
    return createPlugin<PluginOptions>()
        .metadata((metadata) =>
            metadata
                .key(PLUGIN_KEY)
                .name("S3 Plugin")
                .description("Plugin for integrating with AWS S3 for media storage")
                .version("0.2.0")
                .lucid(LUCID_VERSION)
        )
        .recipe((draft) => {
            draft.media.adapter = s3MediaAdapter(pluginOptions);
        })
        .build();
};

// Export a function that takes options and returns the plugin
export default createPluginInstance;
