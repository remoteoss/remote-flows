import { test, expect, Page } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';

/**
 * The flow tests for this screen render it in jsdom with the Radix selects swapped for native
 * ones, which makes them blind to anything Radix itself rejects at render time — an option
 * with an empty value, for one, which took the whole demo down before it was caught by hand.
 * This spec loads the real bundle in a real browser, so that class of failure surfaces in CI
 * instead.
 *
 * The API is stubbed rather than read from the sandbox: the assertions are about rendering,
 * and a shared sandbox's data is not something a regression test should depend on.
 */
const EMPLOYMENT_ID = 'e2e-employment-grace';

const employmentResponse = {
  data: {
    employment: {
      id: EMPLOYMENT_ID,
      full_name: 'Grace Hopper',
      type: 'contractor',
      contractor_type: 'contractor',
      status: 'active',
    },
  },
};

const currenciesResponse = {
  data: [
    { code: 'USD', source: 'default_payment_currency' },
    { code: 'EUR', source: 'contract_country_currency' },
  ],
};

/**
 * Registered after `setupVercelBypass`, which routes everything: Playwright matches routes in
 * reverse registration order, so the specific stubs below take precedence over it.
 */
async function stubInvoiceScheduleApi(page: Page) {
  await page.route('**/api/fetch-refresh-token', (route) =>
    route.fulfill({
      json: { access_token: 'e2e-access-token', expires_in: 3600 },
    }),
  );

  await page.route(
    /\/v1\/contractors\/employments\/[^/]+\/contractor-currencies/,
    (route) => route.fulfill({ json: currenciesResponse }),
  );

  // The flow fetches the employment itself, to tell a Contractor of Record apart.
  await page.route(/\/v1\/employments\/[^/?]+/, (route) =>
    route.fulfill({ json: employmentResponse }),
  );
}

test.describe('Invoice schedule', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await stubInvoiceScheduleApi(page);
  });

  test('renders the schedule form and offers the contractor’s currencies', async ({
    page,
  }) => {
    // Attached before navigating: a Radix render error throws on first paint.
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/?demo=invoice-schedule');

    // The demo asks for the employment id the flow now requires.
    await page.getByLabel('Employment ID:').fill(EMPLOYMENT_ID);
    await page.getByRole('button', { name: 'Create invoice schedule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Create invoice schedule' }),
    ).toBeVisible();

    const currencyField = page.locator('[data-field="currency"]');
    await expect(currencyField).toBeVisible();

    await currencyField.click();
    await expect(page.getByRole('option', { name: 'EUR' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'USD' })).toBeVisible();
    await page.getByRole('option', { name: 'EUR' }).click();
    await expect(currencyField).toContainText('EUR');

    expect(pageErrors).toEqual([]);
  });
});
