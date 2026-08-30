import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    exclude: ["tests/sites-worker.test.mjs", "node_modules/**", "dist/**"],
  },
});
