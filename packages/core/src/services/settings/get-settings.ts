import { settingsFormatter } from "../../libs/formatters/index.js";
import getMediaAdapter from "../../libs/media-adapter/get-adapter.js";
import type { SettingsResponse } from "../../types/response.js";
import type { ServiceFn } from "../../utils/services/types.js";
import { optionServices, processedImageServices } from "../index.js";
import getPluginManifests from "./get-plugin-manifests.js";

const getSettings: ServiceFn<[], SettingsResponse> = async (context) => {
    const [optionsRes, processedImageCountRes, mediaAdapter, pluginManifestsRes] = 
        await Promise.all([
            optionServices.getMultiple(context, {
                names: ["media_storage_used", "license_key_last4"],
            }),
            processedImageServices.getCount(context),
            getMediaAdapter(context.config),
            context.runtimeContext?.pluginManager
                ? getPluginManifests(context, context.runtimeContext.pluginManager)
                : Promise.resolve({ error: undefined, data: [] }),
        ]);
    
    if (processedImageCountRes.error) return processedImageCountRes;
    if (optionsRes.error) return optionsRes;

    const mediaStorageUsedRes = optionsRes.data.find(
        (o) => o.name === "media_storage_used",
    );
    const licenseKeyLast4Res = optionsRes.data.find(
        (o) => o.name === "license_key_last4",
    );

    return {
        error: undefined,
        data: settingsFormatter.formatSingle({
            settings: {
                mediaStorageUsed: mediaStorageUsedRes?.valueInt || 0,
                processedImageCount: processedImageCountRes.data,
                licenseKeyLast4: licenseKeyLast4Res?.valueText ?? null,
                mediaAdapterEnabled: mediaAdapter?.enabled || false,
                pluginManifests: pluginManifestsRes.data || [],
            },
            config: context.config,
        }),
    };
};

export default getSettings;
