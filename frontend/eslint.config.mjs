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
      // Widespread, deliberate pattern in this codebase (~35 files): seeding
      // client-only state (theme, session, localStorage, auth status) after
      // mount, so the server and first client render match exactly before
      // the "real" value is applied — e.g. ThemeToggle.tsx, useAddresses.ts,
      // AnnouncementBar.tsx. Downgraded to warn rather than disabled: a new
      // violation still shows up in `npm run lint`'s output, it just doesn't
      // fail CI on every single push the way the ~36 existing ones did (CI
      // was red on every commit to main before this, regardless of what the
      // commit touched — confirmed by checking recent run history).
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
