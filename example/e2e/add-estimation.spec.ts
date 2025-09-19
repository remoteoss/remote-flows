import { test, expect } from '@playwright/test';
import { fillEstimationForm } from './helpers';

test.describe('add estimation from drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('should not have an employer billing currency', async ({ page }) => {
    await fillEstimationForm(page, {
      country: 'Sweden',
      currency: 'USD',
      salary: '100',
    });

    const title = page.getByTestId('estimation-results-header-title');
    await expect(title).toHaveText('Estimate #01');

    const button = page.getByRole('button', { name: /add estimate/i });
    await button.click();

    const drawerTitle = page.getByTestId(
      'drawer-add-estimation-form-header-title',
    );
    await expect(drawerTitle).toHaveText('Add estimate');

    const drawerDescription = page.getByTestId(
      'drawer-add-estimation-form-header-description',
    );
    await expect(drawerDescription).toHaveText(
      'Estimate the cost of another hire through Remote',
    );

    await expect(page.locator('#currency')).toHaveCount(0);
  });
});
