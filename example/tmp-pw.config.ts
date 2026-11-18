import { defineConfig } from '@playwright/test';
import os from 'os';
export default defineConfig({
  testDir: './e2e',
  testMatch: 'tmp-verify-1964.spec.ts',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3417/?demo=onboarding-basic',
    launchOptions: {
      executablePath: `${os.homedir()}/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
    },
  },
});
