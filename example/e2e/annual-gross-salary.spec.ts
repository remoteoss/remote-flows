import { test, expect } from '@playwright/test';

test.describe('annual gross salary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('shows the annual gross salary both in the header and in the table', async ({
    page,
  }) => {
    await page.selectOption('#country', 'Sweden');
    await page.selectOption('#currency', 'USD');
    await page.fill('#salary_conversion', '100');
    await page.click('.submit-button');
    await expect(
      page.locator('[data-selector=annual-gross-salary-employer-amount]'),
    ).toHaveText('$100.00');
    await expect(
      page.locator(
        '[data-selector=estimation-results-header-annual-gross-salary]',
      ),
    ).toHaveText(/Employee annual gross salary: kr\d+\.\d\d/);
  });
});
