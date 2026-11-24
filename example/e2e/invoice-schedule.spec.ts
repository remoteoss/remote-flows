import { test, expect } from '@playwright/test';
import {
  archiveEmployment,
  createContractorEmployment,
} from './helpers/contractor';
import { fillForm, setupVercelBypass } from './helpers/general';

/**
 * The flow tests for this screen render it in jsdom with the Radix selects swapped for native
 * ones, which makes them blind to anything Radix itself rejects at render time — an option
 * with an empty value, for one, which took the whole demo down before it was caught by hand.
 * This spec loads the real bundle in a real browser, so that class of failure surfaces in CI
 * instead.
 *
 * It runs against the sandbox with a contractor created for the run, so the currency options
 * are the ones the API returns for that contractor.
 */
const CONTRACTOR_CURRENCIES_PATH =
  /^\/v1\/contractors\/employments\/[^/]+\/contractor-currencies$/;

const CREATE_SCHEDULE_PATH = '/v1/contractor-invoice-schedules';

test.describe('Invoice schedule', () => {
  let employmentId: string;

  test.beforeEach(async ({ page }) => {
    employmentId = '';
    await setupVercelBypass(page);
    employmentId = await createContractorEmployment(
      page,
      `Contractor ${Date.now()}`,
    );
  });

  test.afterEach(async ({ page }) => {
    if (!employmentId) {
      return;
    }

    await archiveEmployment(page, employmentId);
  });

  test('renders the schedule form and offers the contractor’s currencies', async ({
    page,
  }) => {
    // Attached before navigating: a Radix render error throws on first paint.
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/?demo=invoice-schedule');

    await page.getByLabel('Employment ID:').fill(employmentId);
    const currenciesResponse = page.waitForResponse((response) =>
      CONTRACTOR_CURRENCIES_PATH.test(new URL(response.url()).pathname),
    );
    await page.getByRole('button', { name: 'Create invoice schedule' }).click();

    const currencies = await currenciesResponse;
    expect(
      currencies.ok(),
      `GET contractor-currencies returned ${currencies.status()}`,
    ).toBe(true);
    const { data } = (await currencies.json()) as {
      data: { code: string }[];
    };
    const currencyCodes = data.map(({ code }) => code);
    expect(currencyCodes).not.toEqual([]);

    await expect(
      page.getByRole('heading', { name: 'Create invoice schedule' }),
    ).toBeVisible();

    const currencyField = page.locator('[data-field="currency"]');
    await expect(currencyField).toBeVisible();

    await currencyField.click();
    await expect(page.getByRole('option')).toHaveText(currencyCodes);
    await page
      .getByRole('option', { name: currencyCodes[0], exact: true })
      .click();
    await expect(currencyField).toContainText(currencyCodes[0]);

    expect(pageErrors).toEqual([]);
  });

  for (const schedule of [
    { name: 'a one-off invoice', frequency: 'One time', endType: null },
    {
      name: 'a monthly recurring invoice',
      frequency: 'Monthly',
      endType: 'never',
    },
  ]) {
    test(`creates a schedule for ${schedule.name}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto('/?demo=invoice-schedule');
      await page.getByLabel('Employment ID:').fill(employmentId);
      await page
        .getByRole('button', { name: 'Create invoice schedule' })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Create invoice schedule' }),
      ).toBeVisible();

      await fillForm(page, [
        { type: 'select', name: 'currency', value: 'EUR' },
        {
          type: 'textField',
          name: 'items.0.description',
          value: 'E2E consulting',
        },
        { type: 'textField', name: 'items.0.amount', value: '100' },
      ]);

      await page.locator('[data-field="periodicity"]').click();
      await page
        .getByRole('option', { name: schedule.frequency, exact: true })
        .click();

      await fillForm(page, [
        ...(schedule.endType
          ? [
              {
                type: 'radio' as const,
                name: 'end_type',
                value: schedule.endType,
              },
            ]
          : []),
        {
          type: 'datepicker',
          testId: 'date-picker-button-start_date',
          value: 'auto',
        },
        { type: 'textField', name: 'number', value: `E2E-${Date.now()}` },
      ]);

      const scheduleResponse = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname === CREATE_SCHEDULE_PATH,
      );
      await page.getByRole('button', { name: 'Create schedule' }).click();

      const created = await scheduleResponse;
      expect(
        created.status(),
        `POST ${CREATE_SCHEDULE_PATH} returned ${created.status()}`,
      ).toBe(201);
      const { data } = (await created.json()) as {
        data: { successes: { id: string }[] };
      };
      expect(data.successes).toHaveLength(1);

      await expect(
        page.getByRole('heading', { name: 'Invoice schedule created' }),
      ).toBeVisible();
      await expect(
        page.getByText(`Schedule ID: ${data.successes[0].id}`),
      ).toBeVisible();
      expect(pageErrors).toEqual([]);
    });
  }
});
