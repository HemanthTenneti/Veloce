import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./.ai-workflow",
  timeout: 90_000,
  retries: 0,
  use: {
    headless: true,
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1600, height: 900 },
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
