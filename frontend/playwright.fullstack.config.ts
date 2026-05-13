/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test";

const FRONTEND_E2E_PORT = 5173;
const BACKEND_E2E_PORT = 8000;

const E2E_BASE_URL = `http://127.0.0.1:${FRONTEND_E2E_PORT}`;
const E2E_API_BASE_URL = `http://127.0.0.1:${BACKEND_E2E_PORT}/api`;

const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  ),
);

export default defineConfig({
  testDir: "./e2e/fullstack",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: [
    {
      name: "Django backend",
      command: `cd ../backend && python manage.py migrate --noinput && python manage.py runserver 127.0.0.1:${BACKEND_E2E_PORT} --noreload`,
      url: `${E2E_API_BASE_URL}/auth/csrf`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...inheritedEnv,
        DJANGO_SETTINGS_MODULE: "config.settings.dev",
        ALLOWED_HOSTS: "127.0.0.1,localhost",
        CORS_ALLOWED_ORIGINS: E2E_BASE_URL,
        CSRF_TRUSTED_ORIGINS: E2E_BASE_URL,
      },
    },
    {
      name: "Vite frontend",
      command: `npm run dev -- --host 127.0.0.1 --port ${FRONTEND_E2E_PORT} --strictPort`,
      url: E2E_BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...inheritedEnv,
        VITE_API_BASE_URL: E2E_API_BASE_URL,
      },
    },
  ],
});
