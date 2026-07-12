import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e config. Phase 0 has a single smoke test that boots the built
 * app and drives the Today check-in in a real browser at phone width. Later
 * phases add flows (join, setup, leaderboard realtime).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    // The 68-year-old-on-Android target: a real mobile viewport.
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
  ],
  // Build + preview so the smoke test exercises the production bundle (incl. PWA).
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
