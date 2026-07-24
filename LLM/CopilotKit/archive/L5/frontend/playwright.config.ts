import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3200",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "LESSON_BACKEND_PORT=8006 ./scripts/run-lesson-backend-e2e.sh",
      url: "http://127.0.0.1:8006/docs",
      timeout: 300_000,
      reuseExistingServer: false,
    },
    {
      command:
        "LANGGRAPH_DEPLOYMENT_URL=http://127.0.0.1:8006 npm run dev -- --port 3200 --host 127.0.0.1",
      url: "http://127.0.0.1:3200",
      timeout: 180_000,
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
