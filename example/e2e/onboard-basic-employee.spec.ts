import { test, expect } from '@playwright/test';
import { setupVercelBypass } from './helpers';

test.describe('Onboard basic employee', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('?demo=onboarding-basic');
  });

  test('show first page', async ({ page }) => {

    const headerAmount = page.getByText(
      /Standard onboarding flow/,
    );

    await expect(headerAmount).toBeVisible();
  });
});
