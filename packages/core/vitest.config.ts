import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        environment: "node",
        hookTimeout: 0,
        testTimeout: 0,
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/**",
                "dist/**",
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/mock-config/**",
                "**/__tests__/**",
                "**/migrations/**",
                "**/translations/**",
            ],
            thresholds: {
                lines: 50,
                functions: 40,
                branches: 60,
                statements: 50,
            },
        },
    },
});
