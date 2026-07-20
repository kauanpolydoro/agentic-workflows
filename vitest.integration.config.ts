import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@kauanpolydoro\/agentic-workflows-core$/,
        replacement: fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
      },
      {
        find: /^@kauanpolydoro\/agentic-workflows-core\/adapter-registry$/,
        replacement: fileURLToPath(
          new URL("./packages/core/src/adapter-registry.ts", import.meta.url),
        ),
      },
    ],
  },
  test: {
    include: ["packages/**/*.integration.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    testTimeout: 20_000,
  },
});
