# Lucid CMS - S3 Plugin

> The official S3 plugin for Lucid

The Lucid CMS S3 plugin registers the required media strategy functions to stream, upload, update and delete media from any S3 compatible storage solution. This plugin supports AWS S3, Cloudflare R2, and other S3-compatible storage providers.

## Installation

```bash
npm install @lucidcms/plugin-s3
```

## Setup

To use the S3 plugin, you need to add it to your Lucid CMS config file. You'll need to provide your S3 endpoint, bucket name, and client configuration.

```typescript
import { nodeAdapter, defineConfig } from "@lucidcms/node-adapter";
import LucidS3 from "@lucidcms/plugin-s3";

export const adapter = nodeAdapter();

export default defineConfig((env) => ({
    // ...other config
    plugins: [
        LucidS3({
            endpoint: env.S3_ENDPOINT,
            bucket: env.S3_BUCKET,
            clientOptions: {
                region: "auto",
                accessKeyId: env.S3_ACCESS_KEY_ID,
                secretAccessKey: env.S3_SECRET_ACCESS_KEY,
            },
        }),
    ],
}));
```

## Configuration

This plugin offers the following configuration options to control S3 storage behavior.

| Property | Type | Description |
|----------|------|-------------|
| `endpoint` | `string` | The S3 endpoint URL |
| `bucket` | `string` | The name of your S3 bucket |
| `clientOptions` | `object` | S3 client configuration options |

### endpoint

The S3 endpoint URL for your storage provider. This will vary depending on your provider, please refer to their documentation for the correct endpoint.

### bucket

The name of your S3 bucket where media files will be stored.

### clientOptions

Configuration options for the S3 client connection.

| Property | Type | Description |
|----------|------|-------------|
| `region` | `string` | The AWS region (use "auto" for Cloudflare R2) |
| `accessKeyId` | `string` | Your S3 access key ID |
| `secretAccessKey` | `string` | Your S3 secret access key |

## Bucket Configuration

As Lucid CMS uses presigned URLs to upload media from the client, you will need to configure your S3 bucket's CORS policy. This will need to allow `PUT` requests, along with the `Content-Type` and `Origin` headers.

### Example Cloudflare R2 CORS Policy

```json
[
    {
        "AllowedOrigins": [
            "YOUR_CMS_ORIGIN_URL"
        ],
        "AllowedMethods": [
            "GET",
            "PUT"
        ],
        "AllowedHeaders": [
            "Origin",
            "Content-Type",
            "x-amz-meta-*"
        ]
    }
]
```

## Migration to Plugin SDK

This plugin has been updated to use the Lucid CMS Plugin SDK. If you're integrating this plugin in your project, no changes are required - the API remains exactly the same.

If you're a plugin developer looking to migrate your own plugins to use the SDK, you can see the migration by examining the source code. The main changes are:

1. **Import changes**: Changed from importing `LucidPlugin` directly to using the SDK
2. **Fluent API**: Used the builder pattern instead of returning an object directly
3. **Type safety**: Leveraged the SDK's comprehensive TypeScript support
4. **Closure pattern**: Used closure to capture plugin options properly

The plugin now uses a closure pattern to properly capture plugin options:

```typescript
import { createPlugin } from "@lucidcms/plugin-sdk";

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

export default createPluginInstance;
```

Instead of the previous format:

```typescript
import type { LucidPlugin } from "@lucidcms/core/types";

const plugin: LucidPlugin<PluginOptions> = (pluginOptions) => {
  return {
    key: PLUGIN_KEY,
    lucid: LUCID_VERSION,
    recipe: (draft) => {
      draft.media.adapter = s3MediaAdapter(pluginOptions);
    },
  };
};

export default plugin;
```

This migration provides better type safety, IDE support, and follows Lucid CMS's modern plugin development patterns while maintaining backward compatibility with the existing plugin API.