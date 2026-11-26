import { expect, test } from '@playwright/test';

test('the sidebar switches between pages', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Flows' });
  await expect(
    page.getByRole('heading', { name: 'Create invoice schedule' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Create invoice' }),
  ).toHaveAttribute('aria-current', 'page');

  await nav.getByRole('link', { name: 'Magic link' }).click();

  await expect(page.getByRole('heading', { name: 'Magic link' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Magic link' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
