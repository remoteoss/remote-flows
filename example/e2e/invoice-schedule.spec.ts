import { test, expect, PlaywrightWorkerArgs } from '@playwright/test';
import {
  archiveEmployment,
  createContractorEmployment,
} from './helpers/contractor';
import { fillTextField, setupVercelBypass } from './helpers/general';
import {
  CREATE_SCHEDULE_PATH,
  customCycleFirstDay,
  defaultCycleDays,
  EndType,
  fillInvoiceItems,
  InvoiceItem,
  InvoiceScheduleFrequency,
  openInvoiceScheduleForm,
  pickStartDate,
  selectCurrency,
  selectCustomCycle,
  selectEndType,
  selectFrequency,
  submitSchedule,
} from './helpers/invoiceSchedule';

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

const INVOICE_NUMBER = 'E2E-1001';

const ONE_ITEM: InvoiceItem[] = [
  { description: 'E2E consulting', amount: '100' },
];

type ScheduleCase = {
  name: string;
  frequency: InvoiceScheduleFrequency;
  items: InvoiceItem[];
  endType?: EndType;
  cycle?: 'default' | 'custom';
  expected: Record<string, unknown>;
  absent: string[];
};

const SCHEDULE_CASES: ScheduleCase[] = [
  {
    name: 'a one-off invoice',
    frequency: 'One time',
    items: ONE_ITEM,
    expected: { periodicity: 'monthly', nr_occurrences: 1 },
    absent: ['custom_days'],
  },
  {
    name: 'a one-off invoice with two items',
    frequency: 'One time',
    items: [
      { description: 'E2E consulting', amount: '100' },
      { description: 'E2E expenses', amount: '50' },
    ],
    expected: { periodicity: 'monthly', nr_occurrences: 1 },
    absent: ['custom_days'],
  },
  {
    name: 'a weekly schedule with no end date',
    frequency: 'Weekly',
    items: ONE_ITEM,
    endType: 'never',
    expected: { periodicity: 'weekly' },
    absent: ['nr_occurrences', 'custom_days'],
  },
  {
    name: 'a bi-weekly schedule with no end date',
    frequency: 'Bi-weekly',
    items: ONE_ITEM,
    endType: 'never',
    expected: { periodicity: 'bi_weekly' },
    absent: ['nr_occurrences', 'custom_days'],
  },
  {
    name: 'a monthly schedule with no end date',
    frequency: 'Monthly',
    items: ONE_ITEM,
    endType: 'never',
    expected: { periodicity: 'monthly' },
    absent: ['nr_occurrences', 'custom_days'],
  },
  {
    name: 'a monthly schedule that ends after 3 occurrences',
    frequency: 'Monthly',
    items: ONE_ITEM,
    endType: { occurrences: 3 },
    expected: { periodicity: 'monthly', nr_occurrences: 3 },
    absent: ['custom_days'],
  },
  {
    name: 'a semi-monthly schedule on the default cycle',
    frequency: 'Semi-monthly',
    items: ONE_ITEM,
    endType: 'never',
    cycle: 'default',
    expected: { periodicity: 'semi_monthly' },
    absent: ['nr_occurrences'],
  },
  {
    name: 'a semi-monthly schedule on a custom cycle',
    frequency: 'Semi-monthly',
    items: ONE_ITEM,
    endType: 'never',
    cycle: 'custom',
    expected: { periodicity: 'semi_monthly' },
    absent: ['nr_occurrences'],
  },
];

async function newGatewayRequest(
  playwright: PlaywrightWorkerArgs['playwright'],
) {
  const { baseURL, extraHTTPHeaders } = test.info().project.use;
  return playwright.request.newContext({ baseURL, extraHTTPHeaders });
}

test.describe('Invoice schedule', () => {
  let employmentId: string;

  test.beforeAll(async ({ playwright }) => {
    employmentId = '';
    const gateway = await newGatewayRequest(playwright);
    try {
      employmentId = await createContractorEmployment(
        { request: gateway },
        `Contractor ${Date.now()}`,
      );
    } finally {
      await gateway.dispose();
    }
  });

  test.afterAll(async ({ playwright }) => {
    if (!employmentId) {
      return;
    }

    const gateway = await newGatewayRequest(playwright);
    try {
      await archiveEmployment({ request: gateway }, employmentId);
    } finally {
      await gateway.dispose();
    }
  });

  test.beforeEach(async ({ page }) => {
    await setupVercelBypass(page);
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

  for (const scheduleCase of SCHEDULE_CASES) {
    test(`creates a schedule for ${scheduleCase.name}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await openInvoiceScheduleForm(page, employmentId);
      await selectCurrency(page, 'EUR');
      await fillInvoiceItems(page, scheduleCase.items);
      await selectFrequency(page, scheduleCase.frequency);

      let startDays: number[] | undefined;
      let customDays: number[] | undefined;
      if (scheduleCase.cycle === 'default') {
        startDays = defaultCycleDays();
        customDays = [15, 31];
      }
      if (scheduleCase.cycle === 'custom') {
        const firstDay = customCycleFirstDay();
        await selectCustomCycle(page, firstDay);
        startDays = [firstDay, firstDay + 14];
        customDays = startDays;
      }
      if (scheduleCase.endType) {
        await selectEndType(page, scheduleCase.endType);
      }

      const picked = await pickStartDate(page, startDays);
      test.skip(
        !picked,
        'The calendar shows one month, so a custom cycle has no selectable day on the 29th to 31st when the month ends on a Sunday',
      );
      await fillTextField(page, 'number', INVOICE_NUMBER);

      const created = await submitSchedule(page);
      expect(
        created.status(),
        `POST ${CREATE_SCHEDULE_PATH} returned ${created.status()}`,
      ).toBe(201);

      const request = created.request().postDataJSON() as {
        contractor_invoice_schedules: Record<string, unknown>[];
      };
      expect(request.contractor_invoice_schedules).toHaveLength(1);
      const [schedule] = request.contractor_invoice_schedules;
      expect(schedule).toMatchObject({
        employment_id: employmentId,
        currency: 'EUR',
        number: INVOICE_NUMBER,
        items: scheduleCase.items.map(({ description, amount }) => ({
          description,
          amount: Number(amount) * 100,
        })),
        ...scheduleCase.expected,
        ...(customDays ? { custom_days: customDays } : {}),
      });
      for (const key of scheduleCase.absent) {
        expect(schedule).not.toHaveProperty(key);
      }

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

  test('asks for the required fields and sends nothing when the form is empty', async ({
    page,
  }) => {
    const submissions: string[] = [];
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        new URL(request.url()).pathname === CREATE_SCHEDULE_PATH
      ) {
        submissions.push(request.url());
      }
    });

    await openInvoiceScheduleForm(page, employmentId);
    await page.getByRole('button', { name: 'Create schedule' }).click();

    await expect(page.getByText('Required field').first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Create invoice schedule' }),
    ).toBeVisible();
    expect(submissions).toEqual([]);
  });

  test('previews the invoice as a PDF before the schedule is created', async ({
    page,
  }) => {
    await openInvoiceScheduleForm(page, employmentId);
    await selectCurrency(page, 'EUR');
    await fillInvoiceItems(page, [
      { description: 'E2E consulting', amount: '100' },
    ]);
    await selectFrequency(page, 'One time');
    await pickStartDate(page);
    await fillTextField(page, 'number', INVOICE_NUMBER);

    const preview = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname ===
          `/v1/employments/${employmentId}/contractor-invoices/preview`,
    );
    await page.getByRole('button', { name: 'Preview invoice' }).click();

    const previewResponse = await preview;
    expect(
      previewResponse.status(),
      `POST contractor-invoices/preview returned ${previewResponse.status()}`,
    ).toBe(200);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Invoice Preview');
    await expect(dialog).toContainText('Download PDF');
    await expect(
      page.getByRole('heading', { name: 'Invoice schedule created' }),
    ).toBeHidden();
  });
});
