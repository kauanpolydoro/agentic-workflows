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
    include: ["packages/**/*.test.ts", "docs/**/*.test.ts", "scripts/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      include: ["packages/core/src/**/*.ts", "packages/cli/src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.integration.test.ts"],
      thresholds: { lines: 85, branches: 85, functions: 85, statements: 85 },
    },
  },
});
