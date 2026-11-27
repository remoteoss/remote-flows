import { expect, test } from '@playwright/test';

test('shows an error for an unknown company on the global payroll flow', async ({
  page,
}) => {
  await page.goto(
    '/?flow=gp-admin&companyId=00000000-0000-0000-0000-000000000000',
  );

  await expect(page.getByRole('alert')).toContainText('Request failed');
});
