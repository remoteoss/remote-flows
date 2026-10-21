import base from './playwright.canary.config';

export default {
  ...base,
  use: {
    ...base.use,
    launchOptions: {
      executablePath:
        '/Users/gabriel/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',
    },
  },
};
