import { describe, it, expect, vi } from "vitest";
import { PluginManager } from "../plugin-manager.js";
import type { LucidPluginManifest } from "../types.js";
import { LucidError } from "../../../utils/errors/index.js";
import type { Config } from "../../../types/config.js";
import type { Hono } from "hono";
import type { LucidHonoGeneric } from "../../../types/hono.js";

describe("PluginManager", () => {
    const mockPlugin: LucidPluginManifest = {
        key: "test-plugin",
        lucid: ">=0.0.0",
        hooks: {
            init: vi.fn().mockResolvedValue({}),
        },
    };

    it("should register plugins correctly", () => {
        const manager = new PluginManager([mockPlugin]);
        expect(manager.getPlugin("test-plugin")).toBe(mockPlugin);
    });

    it("should throw error for duplicate keys", () => {
        expect(() => new PluginManager([mockPlugin, mockPlugin])).toThrow(
            LucidError,
        );
    });

    it("should validate plugin versions", () => {
        const manager = new PluginManager([mockPlugin]);
        expect(() => manager.validatePlugins()).not.toThrow();

        const invalidPlugin = { ...mockPlugin, key: "invalid", lucid: "100.0.0" };
        const manager2 = new PluginManager([invalidPlugin]);
        // Assuming current version is not 100.0.0
        expect(() => manager2.validatePlugins()).toThrow(LucidError);
    });

    it("should execute init hooks", async () => {
        const initMock = vi.fn().mockResolvedValue({});
        const plugin = { ...mockPlugin, hooks: { init: initMock } };
        const manager = new PluginManager([plugin]);

        await manager.executeInitHooks();
        expect(initMock).toHaveBeenCalled();
    });

    it("should execute lifecycle hooks", async () => {
        const beforeServerStartMock = vi.fn();
        const beforeDestroyMock = vi.fn();
        const afterConfigMock = vi.fn();

        const plugin = {
            ...mockPlugin,
            hooks: {
                beforeServerStart: beforeServerStartMock,
                beforeDestroy: beforeDestroyMock,
                afterConfig: afterConfigMock,
            },
        };

        const manager = new PluginManager([plugin]);
        manager.setConfig({} as Config);

        await manager.executeAfterConfigHooks({} as Config);
        expect(afterConfigMock).toHaveBeenCalled();

        await manager.executeBeforeServerStartHooks();
        expect(beforeServerStartMock).toHaveBeenCalled();

        await manager.executeBeforeDestroyHooks();
        expect(beforeDestroyMock).toHaveBeenCalled();
    });

    it("should register extensions", async () => {
        const routeMock = vi.fn();
        const middlewareMock = vi.fn();

        const plugin = {
            ...mockPlugin,
            routes: [routeMock],
            middleware: [middlewareMock],
        };

        const manager = new PluginManager([plugin]);
        manager.setConfig({} as Config);

        await manager.registerExtensions({} as Hono<LucidHonoGeneric>);
        expect(routeMock).toHaveBeenCalled();
        expect(middlewareMock).toHaveBeenCalled();
    });
});
