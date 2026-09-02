import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // e2e/** runs under Playwright (its own `test`/`expect`, a real
    // browser) — Vitest's default glob would otherwise also try to pick up
    // checkout.spec.ts and fail immediately for missing browser fixtures.
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
  },
});
