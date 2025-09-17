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

    await page
      .locator('[data-selector=estimation-results-header-actions-dropdown]')
      .click();
    await page
      .locator(
        '[data-selector=estimation-results-header-actions-dropdown-edit]',
      )
      .click();

    await expect(
      page.locator('[data-selector=drawer-edit-estimation-form-header-title]'),
    ).toHaveText('Edit estimate');

    await expect(
      page.locator(
        '[data-selector=drawer-edit-estimation-form-header-description]',
      ),
    ).toHaveText('Estimate #1');

    await page.fill('#salary_conversion', '200');
    await page.click('.submit-button');

    await expect(
      page.locator('[data-selector=annual-gross-salary-employer-amount]'),
    ).toHaveText('$200.00');
  });
});
