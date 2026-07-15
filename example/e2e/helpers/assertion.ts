// oxlint-disable react-hooks/rules-of-hooks
import { test as base } from '@playwright/test';

/**
 * Extended test fixture that disables animations for webkit.
 * Webkit handles CSS transitions differently, causing Playwright to wait
 * indefinitely for elements to be "stable" during interactions.
 */
export const test = base.extend({
  page: async ({ page, browserName }, use) => {
    // Disable animations for webkit to prevent stability issues
    if (browserName === 'webkit') {
      // Inject CSS after every navigation
      page.on('load', async () => {
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
          `,
        });
      });
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
