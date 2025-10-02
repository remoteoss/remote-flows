import { test, expect } from '@playwright/test';
import { fillEstimationForm, setupVercelBypass } from './helpers';

test.describe('annual gross salary', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
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
    const employerAmount = page.getByTestId(
      'annual-gross-salary-employer-amount',
    );
    await expect(employerAmount).toHaveText('$100.00');

    // Using getByText for static text + regex for dynamic part
    const headerAmount = page.getByText(
      /Employee annual gross salary: kr\d+\.\d\d/,
    );
    await expect(headerAmount).toBeVisible();
  });
});
