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
      const disableAnimationsCSS = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;

      // Method 1: Use addInitScript to inject before any page loads
      // This executes in the browser context before the page loads
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `;
        // Inject immediately, before DOMContentLoaded
        if (document.head) {
          document.head.appendChild(style);
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(style);
          });
        }
      });

      // Method 2: Also inject via page.on('load') as a fallback
      page.on('load', async () => {
        await page.addStyleTag({ content: disableAnimationsCSS });
      });
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
