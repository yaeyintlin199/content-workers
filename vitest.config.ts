import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "text-summary"],
            exclude: [
                "node_modules/**",
                "**/dist/**",
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/*.spec.ts",
                "**/*.spec.tsx",
                "**/mock-config/**",
                "**/test/**",
                "**/__tests__/**",
                "**/migrations/**",
                "**/translations/**",
            ],
            include: [
                "packages/*/src/**/*.ts",
                "packages/*/src/**/*.tsx",
            ],
            all: true,
            thresholds: {
                lines: 22,
                functions: 28,
                branches: 64,
                statements: 22,
                perFile: false,
            },
        },
    },
});
