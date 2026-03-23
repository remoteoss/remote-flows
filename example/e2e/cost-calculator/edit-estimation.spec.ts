import { test, expect } from '@playwright/test';
import { fillEstimationForm, setupVercelBypass } from './helpers';

test.describe('edit estimation', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await page.goto('/?demo=with-premium-benefits-cost-calculator');
  });

  test('edits an estimation', async ({ page }) => {
    await fillEstimationForm(page, {
      country: 'Sweden',
      currency: 'USD',
      salary: '100',
    });

    const title = page.getByTestId('estimation-results-header-title');
    await expect(title).toHaveText('Estimate #01');

    // Open actions dropdown and click edit
    const actionsDropdown = page.getByRole('button', { name: /actions/i });

    await actionsDropdown.click();

    const editAction = page.getByRole('button', { name: /edit/i });
    await editAction.click();

    // Check drawer content
    const drawerTitle = page.getByTestId(
      'drawer-edit-estimation-form-header-title',
    );
    await expect(drawerTitle).toHaveText('Edit estimate');

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

    const drawerDescription = page.getByTestId(
      'drawer-edit-estimation-form-header-description',
    );
    await expect(drawerDescription).toHaveText('Estimate #1');

    // Update salary and submit
    await page.fill('#salary_conversion', '200');
    await page.fill('#estimation_title', 'Test estimation');
    await page.click('.submit-button');

    // Verify updated amount
    const employerAmount = page.getByTestId(
      'annual-gross-salary-employer-amount',
    );
    await expect(employerAmount).toHaveText('$200.00');

    await page.getByText('Test estimation');
  });
});
