import { vi } from "vitest";

// Mock fetch for plugin manifest loading
global.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, "location", {
    value: {
        href: "http://localhost:3000",
    },
    writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Setup console methods for tests
global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
};