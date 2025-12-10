import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
    plugins: [solidPlugin()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/**",
                "dist/**",
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/*.spec.ts",
                "**/*.spec.tsx",
                "**/test/**",
                "**/__tests__/**",
            ],
        },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@types": fileURLToPath(new URL("../core/src/types.ts", import.meta.url)),
            "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
        },
    },
});