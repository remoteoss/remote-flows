import { test, expect } from '@playwright/test';
import { fillEstimationForm } from './helpers';

test.describe('edit estimation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('edits an estimation', async ({ page }) => {
    await fillEstimationForm(page, {
      country: 'Sweden',
      currency: 'USD',
      salary: '100',
    });

    await expect(
      page.locator('[data-selector=estimation-results-header-title]'),
    ).toHaveText('Estimate #1');
  });
});
