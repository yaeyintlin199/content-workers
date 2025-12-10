# @content-workers/plugin-sdk

The official SDK for creating Lucid CMS plugins with a fluent builder API. This package provides a developer-friendly way to create plugins by using method chaining to configure all aspects of your plugin.

## Features

- **Fluent API**: Chain methods to build your plugin configuration
- **Type-safe**: Full TypeScript support with generic types
- **Comprehensive**: Support for metadata, recipes, hooks, routes, middleware, services, and admin configuration
- **Registry-compatible**: Generates manifests that match Lucid CMS plugin registry expectations
- **Tested**: Comprehensive test suite ensuring the SDK works correctly

## Installation

```bash
npm install @content-workers/plugin-sdk @content-workers/core
```

## Basic Usage

```typescript
import { createPlugin } from "@content-workers/plugin-sdk";
import type { LucidCMS } from "@content-workers/core";

const myPlugin = createPlugin()
  .metadata((metadata) =>
    metadata
      .key("my-plugin")
      .name("My Plugin")
      .description("A custom plugin for Lucid CMS")
      .version("1.0.0")
      .lucid("^0.12.1")
  )
  .recipe((draft) => {
    // Modify the Lucid CMS config here
    // Add custom fields, modify collections, etc.
  })
  .hooks((hooks) =>
    hooks
      .init(async () => {
        // Plugin initialization logic
      })
      .beforeServerStart(async (context) => {
        // Logic to run before server starts
      })
  )
  .build();

export default myPlugin;
```

## API Reference

### createPlugin

Creates a new plugin builder instance.

```typescript
function createPlugin<Options = undefined>(pluginOptions?: Options): PluginBuilder<Options>
```

### PluginBuilder

The main interface for building plugins through method chaining.

#### .metadata()

Configures the plugin metadata.

```typescript
.metadata((metadata) => {
  metadata
    .key("plugin-key")
    .name("Plugin Name")
    .description("Plugin description")
    .version("1.0.0")
    .lucid("^0.12.1")
})
```

#### .recipe()

Adds a recipe function to modify the Lucid CMS configuration.

```typescript
.recipe((draft) => {
  // Modify draft (WritableDraft<Config>)
  draft.collections.push(/* ... */);
  draft.media.adapter = /* ... */;
})
```

#### .hooks()

Configures plugin lifecycle hooks.

```typescript
.hooks((hooks) => {
  hooks
    .init(async () => {
      // Called during config processing
    })
    .afterConfig(async (config) => {
      // Called after config is processed
    })
    .beforeServerStart(async (context) => {
      // Called before server starts
    })
    .beforeDestroy(async () => {
      // Called before app shutdown
    })
    .build(async ({ paths }) => {
      // Called during build process
      return { artifacts: [] };
    })
})
```

#### .routes()

Adds backend API routes.

```typescript
import { Hono } from "hono";
import type { LucidHonoGeneric } from "@content-workers/core";

.routes((routes) => {
  routes.add(async (app: Hono<LucidHonoGeneric>, context) => {
    app.get("/my-route", (c) => {
      return c.json({ message: "Hello from plugin!" });
    });
  });
})
```

#### .middleware()

Adds backend middleware.

```typescript
.middleware((middleware) => {
  middleware.add(async (app, context) => {
    app.use("*", async (c, next) => {
      // Add middleware logic
      await next();
    });
  });
})
```

#### .services()

Adds backend services.

```typescript
.services((services) => {
  services
    .add("myService", {
      doSomething: () => "Hello from service!"
    })
    .add("anotherService", { /* ... */ });
})
```

#### .admin()

Configures admin interface components.

```typescript
.admin((admin) => {
  admin
    .entry("/admin/my-plugin")
    .css("/admin/my-plugin.css")
    .route({
      key: "dashboard",
      label: "Plugin Dashboard",
      path: "/dashboard",
      permission: "view_dashboard"
    })
    .sidebarItem({
      key: "settings",
      label: "Settings",
      icon: "cog",
      route: "/settings",
      permission: "manage_settings"
    })
    .settingsPanel({
      key: "general",
      label: "General",
      route: "/general"
    });
})
```

#### .checkCompatibility()

Adds a compatibility checker.

```typescript
.checkCompatibility((checker) => {
  checker(({ runtimeContext, config }) => {
    // Check if plugin is compatible with current environment
    if (runtimeContext.nodeEnv !== "production") {
      throw new Error("Plugin only works in production");
    }
  });
})
```

#### .build()

Builds and returns the final Lucid plugin.

```typescript
.build(): LucidPlugin<Options>
```

## Plugin Options

You can pass options to your plugin:

```typescript
interface PluginOptions {
  apiKey: string;
  debug?: boolean;
}

const myPlugin = createPlugin<PluginOptions>({
  apiKey: "my-api-key",
  debug: false
})
  .metadata((metadata) => metadata.key("my-plugin"))
  .recipe((draft) => {
    // Use pluginOptions via closure or context
  })
  .build();
```

## Migration from Legacy Plugin Format

If you have existing plugins using the legacy format, here's how to migrate:

### Before (Legacy)

```typescript
import type { LucidPlugin } from "@content-workers/core/types";

const plugin: LucidPlugin<PluginOptions> = (pluginOptions) => {
  return {
    key: PLUGIN_KEY,
    lucid: LUCID_VERSION,
    recipe: (draft) => {
      // Recipe logic
    },
    hooks: {
      init: async () => { /* ... */ }
    }
  };
};
```

### After (SDK)

```typescript
import { createPlugin } from "@content-workers/plugin-sdk";

const plugin = createPlugin<PluginOptions>()
  .metadata((metadata) =>
    metadata
      .key(PLUGIN_KEY)
      .name("Plugin Name")
      .lucid(LUCID_VERSION)
  )
  .recipe((draft) => {
    // Recipe logic
  })
  .hooks((hooks) =>
    hooks.init(async () => { /* ... */ })
  )
  .build();
```

## Examples

### Plugin with Options and Admin Interface

```typescript
import { createPlugin } from "@content-workers/plugin-sdk";
import type { Hono } from "hono";

interface S3PluginOptions {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const createS3Plugin = (options: S3PluginOptions) => {
  return createPlugin<S3PluginOptions>(options)
    .metadata((metadata) =>
      metadata
        .key("s3-storage")
        .name("S3 Storage")
        .description("Amazon S3 storage adapter")
        .version("1.0.0")
        .lucid("^0.12.1")
    )
    .recipe((draft) => {
      // Configure S3 adapter
      draft.media.adapter = createS3Adapter(options);
    })
    .admin((admin) =>
      admin
        .entry("/admin/s3-storage")
        .route({
          key: "settings",
          label: "S3 Settings",
          path: "/settings"
        })
        .sidebarItem({
          key: "files",
          label: "Files",
          icon: "folder",
          route: "/files"
        })
    )
    .build();
};

export default createS3Plugin;
```

### Plugin with Hooks and Services

```typescript
import { createPlugin } from "@content-workers/plugin-sdk";

const analyticsPlugin = createPlugin()
  .metadata((metadata) =>
    metadata
      .key("analytics")
      .name("Analytics Plugin")
      .description("Track user interactions")
  )
  .hooks((hooks) =>
    hooks
      .init(async () => {
        // Initialize analytics service
      })
      .afterConfig(async (config) => {
        // Post-config setup
      })
  )
  .services((services) =>
    services.add("analytics", {
      track: (event: string, data: any) => {
        // Track analytics event
      },
      getStats: () => {
        // Get analytics statistics
      }
    })
  )
  .build();
```

## TypeScript Support

The SDK is fully typed and provides excellent IntelliSense support. All plugin builder methods are type-safe, and the generated manifests match the Lucid CMS plugin registry expectations.

## Testing

The SDK includes comprehensive tests to ensure the fluent API works correctly and generates valid manifests:

```bash
npm test
```

## Integration

This SDK is designed to work seamlessly with the Lucid CMS plugin ecosystem. Generated plugins are compatible with:

- Lucid CMS plugin registry
- Admin interface rendering
- Build process integration
- Runtime plugin loading

## Contributing

When contributing to the SDK, ensure:

1. All new features include comprehensive tests
2. Type definitions are updated accordingly
3. Documentation is updated
4. The fluent API remains consistent

## License

MIT