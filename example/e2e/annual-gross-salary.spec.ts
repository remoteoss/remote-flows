import { test, expect } from '@playwright/test';

test.describe('annual gross salary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('shows the annual gross salary', async ({ page }) => {
    await page.selectOption('#country', 'Argentina');
    await page.selectOption('#currency', 'USD');
    await page.fill('#salary_conversion', '1000');
    await page.click('.submit-button');
    await expect(
      page.locator('[data-selector=annual-gross-salary-employer-amount]'),
    ).toHaveText('$1,000.00');
  });
});
