import { test, expect } from '@playwright/test';
import { fillEstimationForm, setupVercelBypass } from './helpers';

test.describe('add estimation from drawer', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('should not have an employer billing currency', async ({ page }) => {
    await fillEstimationForm(page, {
      country: 'Sweden',
      currency: 'USD',
      salary: '100',
      management_fee: '399',
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

    await expect(page.getByText('$399.00')).toBeVisible();

    await expect(
      page.getByText(
        'The billing currency will appear as the one you picked earlier',
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        'Your billing currency will be shown as USD, based on your earlier selection',
      ),
    ).toBeVisible();

    await expect(page.locator('#currency')).toHaveCount(0);

    await fillEstimationForm(page, {
      country: 'Sweden',
      salary: '200',
    });

    await expect(page.getByText('$200.00')).toBeVisible();
  });
});
