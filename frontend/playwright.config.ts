import { defineConfig, devices } from "@playwright/test";

// Requires both the frontend dev server AND the backend
// (`php artisan serve --port=8001`, see backend/README) to be running —
// this suite exercises real signup + checkout against the real API, not
// mocks. reuseExistingServer picks up the dev server you already have
// running instead of trying to launch a second one on the same port.
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  // Turbopack dev mode compiles each route on its first request — a page
  // this app's size can take well over the 30s default before its JS is
  // even served, let alone interactive. Generous on purpose; this suite
  // isn't measuring performance.
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    actionTimeout: 30_000,
    navigationTimeout: 90_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
