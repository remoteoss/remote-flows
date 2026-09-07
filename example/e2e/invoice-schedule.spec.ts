import { test, expect, Page } from '@playwright/test';
import { setupVercelBypass } from './helpers/general';

/**
 * The flow tests for this screen render it in jsdom with the Radix selects swapped for native
 * ones, which makes them blind to anything Radix itself rejects at render time — an option
 * with an empty value, for one, which took the whole demo down before it was caught by hand.
 * This spec loads the real bundle in a real browser and picks a contractor, so that class of
 * failure surfaces in CI instead.
 *
 * The API is stubbed rather than read from the sandbox: the assertions are about rendering,
 * and a shared sandbox's contractor list is not something a regression test should depend on.
 */
const contractorsResponse = {
  data: {
    current_page: 1,
    total_count: 2,
    total_pages: 1,
    employments: [
      {
        id: 'e2e-employment-grace',
        full_name: 'Grace Hopper',
        type: 'contractor',
        status: 'active',
      },
      {
        id: 'e2e-employment-ada',
        full_name: 'Ada Lovelace',
        type: 'contractor',
        status: 'active',
      },
    ],
  },
};

const employmentResponse = {
  data: {
    employment: {
      id: 'e2e-employment-grace',
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

  // The list and the single employment share a prefix, so they are told apart by whether an
  // id follows: `/v1/employments` for the picker, `/v1/employments/<id>` for the CoR check.
  await page.route(/\/v1\/employments(\?|$)/, (route) =>
    route.fulfill({ json: contractorsResponse }),
  );

  await page.route(/\/v1\/employments\/[^/?]+/, (route) =>
    route.fulfill({ json: employmentResponse }),
  );
}

test.describe('Invoice schedule', () => {
  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
    await stubInvoiceScheduleApi(page);
  });

  test('renders the schedule form and offers the chosen contractor’s currencies', async ({
    page,
  }) => {
    // Attached before navigating: a Radix render error throws on first paint.
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/?demo=invoice-schedule');

    await expect(
      page.getByRole('heading', { name: 'Create invoice schedule' }),
    ).toBeVisible();

    // Rendering the currency field at all is the regression: it has no real options until a
    // contractor is chosen, and its stand-in used to be an option Radix refuses.
    const currencyField = page.locator('[data-field="currency"]');
    await expect(currencyField).toBeVisible();
    await expect(currencyField).toContainText('Select a contractor first');

    const contractorPicker = page
      .locator('[data-field="employment_id"]')
      .getByRole('combobox');
    await contractorPicker.click();

    // The picker queries the API by name as you type, debounced.
    await page.getByPlaceholder('Search contractors…').fill('grace');
    await page.getByRole('option', { name: 'Grace Hopper' }).click();

    await expect(contractorPicker).toContainText('Grace Hopper');

    await currencyField.click();
    await expect(page.getByRole('option', { name: 'EUR' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'USD' })).toBeVisible();
    await page.getByRole('option', { name: 'EUR' }).click();
    await expect(currencyField).toContainText('EUR');

    expect(pageErrors).toEqual([]);
  });
});
