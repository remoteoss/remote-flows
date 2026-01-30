import { test, expect } from '@playwright/test';
import { fillEstimationForm, setupVercelBypass } from './helpers';

test.describe('hiring budget', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('shows the hiring budget option', async ({ page }) => {
    await page.locator('#my_hiring_budget').click();

    await expect(page.locator('[for=salary]')).toHaveText('Hiring budget');

    await fillEstimationForm(page, {
      country: 'Sweden',
      currency: 'USD',
      salary: '100000',
    });

    const headerAmount = page.getByText(
      /Employee annual gross salary: SEK\s[\d,]+\.\d{2}/,
    );

    await expect(headerAmount).toBeVisible();
  });
});
