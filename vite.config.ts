import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  base: "./",
  test: {
    environment: "node",
    passWithNoTests: true,
    exclude: [...configDefaults.exclude, ".worktrees/**"],
  },
});
