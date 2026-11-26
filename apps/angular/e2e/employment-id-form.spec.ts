import { expect, test } from '@playwright/test';

test('asks for an employment id when the url has none', async ({ page }) => {
  await page.goto('/');

  await page
    .getByLabel('Employment ID')
    .fill('00000000-0000-0000-0000-000000000000');
  await page.getByRole('button', { name: 'Create invoice schedule' }).click();

  await expect(page).toHaveURL(
    /employmentId=00000000-0000-0000-0000-000000000000/,
  );
  await expect(page.getByRole('alert')).toContainText(
    'Could not load the invoice schedule form',
  );
});
