import { expect, test } from '@playwright/test';

test('shows an error for an unknown employment', async ({ page }) => {
  await page.goto('/?employmentId=00000000-0000-0000-0000-000000000000');

  await expect(page.getByRole('alert')).toContainText(
    'Could not load the invoice schedule form',
  );
});
