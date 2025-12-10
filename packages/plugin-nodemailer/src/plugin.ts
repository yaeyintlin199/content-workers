import { createPlugin } from "@content-workers/plugin-sdk";
import T from "./translations/index.js";
import verifyTransporter from "./utils/verify-transporter.js";
import isValidData from "./utils/is-valid-data.js";
import { PLUGIN_KEY, LUCID_VERSION, PLUGIN_IDENTIFIER } from "./constants.js";
import type { EmailAdapterInstance, LucidPlugin } from "@content-workers/core/types";
import type { PluginOptions } from "./types/types.js";

// Create a closure to capture the plugin options
const createPluginInstance = (pluginOptions: PluginOptions) => {
    return createPlugin<PluginOptions>()
        .metadata((metadata) =>
            metadata
                .key(PLUGIN_KEY)
                .name("Nodemailer Plugin")
                .description("Plugin for email sending using Nodemailer")
                .version("0.3.0")
                .lucid(LUCID_VERSION)
        )
        .recipe((draft) => {
            // Create the email adapter with the options captured in closure
            const emailAdapter: EmailAdapterInstance = {
                type: "email-adapter",
                key: PLUGIN_IDENTIFIER,
                lifecycle: {
                    init: async () => {
                        await verifyTransporter(pluginOptions.transporter);
                    },
                    destroy: async () => {
                        pluginOptions.transporter.close();
                    },
                },
                services: {
                    send: async (email) => {
                        try {
                            await verifyTransporter(pluginOptions.transporter);
                            const data = await pluginOptions.transporter.sendMail({
                                from: `${email.from.name} <${email.from.email}>`,
                                to: email.to,
                                subject: email.subject,
                                cc: email.cc,
                                bcc: email.bcc,
                                replyTo: email.replyTo,
                                text: email.text,
                                html: email.html,
                            });
                            return {
                                success: true,
                                deliveryStatus: "sent",
                                message: T("email_successfully_sent"),
                                data: isValidData(data) ? data : null,
                            };
                        } catch (error) {
                            return {
                                success: false,
                                deliveryStatus: "failed",
                                message:
                                    error instanceof Error
                                        ? error.message
                                        : T("email_failed_to_send"),
                            };
                        }
                    },
                },
            };
            
            draft.email.adapter = emailAdapter;
        })
        .build();
};

// Export a function that takes options and returns the plugin
export default createPluginInstance;
