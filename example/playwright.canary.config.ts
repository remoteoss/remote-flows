import { defineConfig, devices, ReporterDescription } from '@playwright/test';

const PORT = process.env.PORT || '3001';

const reporter: ReporterDescription[] = process.env.CI
  ? [['list'], ['html']]
  : [['list']];
if (process.env.SCHEMA_CANARY_RESULTS) {
  reporter.push(['json', { outputFile: process.env.SCHEMA_CANARY_RESULTS }]);
}

export default defineConfig({
  testDir: './e2e/canary',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter,
  use: {
    baseURL: process.env.BASE_URL || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
