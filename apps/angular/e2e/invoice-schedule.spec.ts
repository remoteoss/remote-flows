import { expect, PlaywrightWorkerArgs, test } from '@playwright/test';
import {
  archiveEmployment,
  createContractorEmployment,
} from './helpers/contractor';
import {
  CREATE_SCHEDULE_PATH,
  CUSTOM_CYCLE_FIRST_DAY,
  EndType,
  fillInvoiceItems,
  InvoiceItem,
  InvoiceScheduleFrequency,
  isCustomCycleDay,
  isDefaultCycleDay,
  openInvoiceScheduleForm,
  pickStartDate,
  previewInvoice,
  selectCurrency,
  selectCustomCycle,
  selectEndType,
  selectFrequency,
  submitSchedule,
} from './helpers/invoiceSchedule';

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
    expected: { periodicity: 'semi_monthly', custom_days: [15, 31] },
    absent: ['nr_occurrences'],
  },
  {
    name: 'a semi-monthly schedule on a custom cycle',
    frequency: 'Semi-monthly',
    items: ONE_ITEM,
    endType: 'never',
    cycle: 'custom',
    expected: {
      periodicity: 'semi_monthly',
      custom_days: [CUSTOM_CYCLE_FIRST_DAY, CUSTOM_CYCLE_FIRST_DAY + 14],
    },
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

  test('renders the schedule form and offers the contractor’s currencies', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const currenciesResponse = page.waitForResponse((response) =>
      CONTRACTOR_CURRENCIES_PATH.test(new URL(response.url()).pathname),
    );
    await openInvoiceScheduleForm(page, employmentId);

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

    const currencyField = page.getByRole('combobox', {
      name: 'Invoice currency *',
    });
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

      let isAllowedDay: ((date: Date) => boolean) | undefined;
      if (scheduleCase.cycle === 'default') {
        isAllowedDay = isDefaultCycleDay;
      }
      if (scheduleCase.cycle === 'custom') {
        await selectCustomCycle(page, CUSTOM_CYCLE_FIRST_DAY);
        isAllowedDay = isCustomCycleDay;
      }
      if (scheduleCase.endType) {
        await selectEndType(page, scheduleCase.endType);
      }

      await pickStartDate(page, isAllowedDay);
      await page
        .getByRole('textbox', { name: 'Invoice number' })
        .fill(INVOICE_NUMBER);

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
      });
      for (const key of scheduleCase.absent) {
        expect(schedule).not.toHaveProperty(key);
      }

      const { data } = (await created.json()) as {
        data: { successes: { id: string }[] };
      };
      expect(data.successes).toHaveLength(1);

      await expect(
        page.getByText(`Invoice schedule created: ${data.successes[0].id}`),
      ).toBeVisible();
      expect(pageErrors).toEqual([]);
    });
  }

  test('previews the invoice as a PDF without creating a schedule', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
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
    await selectCurrency(page, 'EUR');
    await fillInvoiceItems(page, ONE_ITEM);
    await selectFrequency(page, 'One time');
    await pickStartDate(page);
    await page
      .getByRole('textbox', { name: 'Invoice number' })
      .fill(INVOICE_NUMBER);

    const previewed = await previewInvoice(page);
    expect(
      previewed.status(),
      `POST contractor-invoices/preview returned ${previewed.status()}`,
    ).toBe(200);

    await expect(page.locator('iframe[title="Invoice preview"]')).toBeVisible();
    await expect(page.getByText(/Invoice schedule created/)).toBeHidden();
    expect(submissions).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('explains the invoice number input', async ({ page }) => {
    await openInvoiceScheduleForm(page, employmentId);

    await expect(
      page.getByText(
        "We'll automatically number all invoices after the first one based on this number.",
      ),
    ).toBeVisible();
  });

  test('applies the default values and field changes the page passes in', async ({
    page,
  }) => {
    await openInvoiceScheduleForm(page, employmentId, {
      note: 'Paid monthly',
      noteLabel: 'Memo for the contractor',
    });

    await expect(
      page.getByRole('textbox', { name: 'Memo for the contractor' }),
    ).toHaveValue('Paid monthly');
  });

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
    await page.getByRole('button', { name: 'Create invoice schedule' }).click();

    await expect(page.getByText('Required field').first()).toBeVisible();
    await expect(page.getByText(/Invoice schedule created/)).toBeHidden();
    expect(submissions).toEqual([]);
  });
});
