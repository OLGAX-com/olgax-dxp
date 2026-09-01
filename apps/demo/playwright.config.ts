import { defineConfig, devices } from "@playwright/test";

// A single smoke test, not a full e2e suite - see e2e/smoke.spec.ts. Runs
// against a dedicated sqlite file (never the local dev database) and its
// own port, seeded fresh by e2e/global-setup.ts before the suite starts.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx next dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: "file:./payload.e2e.db",
      PAYLOAD_SECRET: "e2e-test-secret-not-for-production",
    },
  },
});
