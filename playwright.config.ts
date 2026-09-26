import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (ADR-019): the real server with the built interface in Chromium.
 * Run `npx vite build` first. The data directory is a fresh temporary directory per run,
 * shared with the workers through the environment.
 */
process.env.SKRIPTORIUM_E2E_DATA ??= mkdtempSync(
  join(tmpdir(), "skriptorium-e2e-"),
);
const port = 8123;

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${String(port)}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Cloud sessions have an older Chromium preinstalled; CI installs the matching one.
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
        },
      },
    },
  ],
  webServer: {
    command: `uv run uvicorn skriptorium.api:create_app --factory --no-access-log --port ${String(port)}`,
    url: `http://localhost:${String(port)}/api/health`,
    reuseExistingServer: false,
    env: { SKRIPTORIUM_DATA_DIR: process.env.SKRIPTORIUM_E2E_DATA },
  },
});
