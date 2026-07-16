import { defineConfig } from "vitest/config";

export default defineConfig({
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
