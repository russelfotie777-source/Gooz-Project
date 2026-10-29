import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Same reasoning as frontend/eslint.config.mjs: a deliberate pattern
      // here too (resetting derived state — results, order, quantities —
      // inside an effect when its guard condition isn't met), not a bug.
      // Downgraded to warn so a real new issue still surfaces without
      // failing CI on every push regardless of what it touches.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
