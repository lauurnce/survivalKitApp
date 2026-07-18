import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Agent worktrees live under .claude/worktrees with their own full copy of
    // the repo — without this, running vitest from the root collects every
    // test twice and reports failures from unrelated in-progress branches.
    exclude: [...configDefaults.exclude, "**/.claude/**"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
