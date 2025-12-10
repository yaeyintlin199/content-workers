# Lucid CMS - Nodemailer Plugin

> The official Nodemailer plugin for Lucid

The Lucid CMS Nodemailer plugin registers the email strategy config and uses Nodemailer to send emails. This plugin is ideal if you want to use your own SMTP server or email service provider that's compatible with Nodemailer.

## Installation

```bash
npm install @content-workers/plugin-nodemailer
```

## Setup

To use the Nodemailer plugin, you need to add it to your Lucid CMS config file. You'll need to provide the from email configuration and a Nodemailer transporter instance.

```typescript
import { nodeAdapter, defineConfig } from "@content-workers/node-adapter";
import LucidNodemailer from "@content-workers/plugin-nodemailer";

export const adapter = nodeAdapter();

export default defineConfig((env) => ({
    // ...other config
    plugins: [
        LucidNodemailer({
            transporter: transporter,
        }),
    ],
}));
```

## Configuration

This plugin offers the following configuration options to control email sending behavior.

| Property | Type | Description |
|----------|------|-------------|
| `transporter` | `Transporter` | A configured Nodemailer transporter instance |

### transporter

This should be a configured Nodemailer transporter instance. You can create this using any of the transport methods supported by Nodemailer, such as SMTP, Gmail, or other email service providers.

## Migration to Plugin SDK

This plugin has been updated to use the Lucid CMS Plugin SDK. If you're integrating this plugin in your project, no changes are required - the API remains exactly the same.

If you're a plugin developer looking to migrate your own plugins to use the SDK, you can see the migration by examining the source code. The main changes are:

1. **Import changes**: Changed from importing `LucidPlugin` directly to using the SDK
2. **Fluent API**: Used the builder pattern instead of returning an object directly
3. **Type safety**: Leveraged the SDK's comprehensive TypeScript support
4. **Closure pattern**: Used closure to capture plugin options properly

The plugin now uses a closure pattern to properly capture plugin options:

```typescript
import { createPlugin } from "@content-workers/plugin-sdk";

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
            // Email sending logic using captured pluginOptions
          },
        },
      };
      
      draft.email.adapter = emailAdapter;
    })
    .build();
};

export default createPluginInstance;
```

Instead of the previous format:

```typescript
import type { LucidPlugin } from "@content-workers/core/types";

const plugin: LucidPlugin<PluginOptions> = (pluginOptions) => {
  return {
    key: PLUGIN_KEY,
    lucid: LUCID_VERSION,
    recipe: (draft) => {
      draft.email.adapter = {
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
            // Email sending logic
          },
        },
      };
    },
  };
};

export default plugin;
```

This migration provides better type safety, IDE support, and follows Lucid CMS's modern plugin development patterns while maintaining backward compatibility with the existing plugin API.
