import { test, expect } from '@playwright/test';
import { fillEstimationForm } from './helpers';

test.describe('annual gross salary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('shows the annual gross salary both in the header and in the table', async ({
    page,
  }) => {
    await fillEstimationForm(page, {
      country: 'Sweden',
      currency: 'USD',
      salary: '100',
    });
    await expect(
      page.locator('[data-testid=annual-gross-salary-employer-amount]'),
    ).toHaveText('$100.00');
    await expect(
      page.locator(
        '[data-testid=estimation-results-header-annual-gross-salary]',
      ),
    ).toHaveText(/Employee annual gross salary: kr\d+\.\d\d/);
  });
});
