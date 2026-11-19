import { expect, test } from '@playwright/test';

test('shows the gateway error for an unknown employment', async ({ page }) => {
  await page.goto('/?employmentId=00000000-0000-0000-0000-000000000000');

  await expect(page.getByText('Employment not found')).toBeVisible();
});
