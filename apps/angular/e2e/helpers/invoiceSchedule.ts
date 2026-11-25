import { expect, Page } from '@playwright/test';

export const CREATE_SCHEDULE_PATH = '/v1/contractor-invoice-schedules';
export const PREVIEW_INVOICE_PATH =
  /^\/v1\/employments\/[^/]+\/contractor-invoices\/preview$/;

export type InvoiceScheduleFrequency =
  | 'One time'
  | 'Weekly'
  | 'Bi-weekly'
  | 'Semi-monthly'
  | 'Monthly';

export type InvoiceItem = { description: string; amount: string };

export type EndType = 'never' | { occurrences: number };

export async function openInvoiceScheduleForm(
  page: Page,
  employmentId: string,
  params: Record<string, string> = {},
) {
  const query = new URLSearchParams({ employmentId, ...params });
  await page.goto(`/?${query}`);
  await expect(
    page.getByRole('button', { name: 'Create invoice schedule' }),
  ).toBeVisible();
}

async function selectOption(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
}

export async function selectCurrency(page: Page, code: string) {
  await selectOption(page, 'Invoice currency *', code);
}

export async function fillInvoiceItems(page: Page, items: InvoiceItem[]) {
  for (const [index, item] of items.entries()) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Add item' }).click();
    }
    await page
      .getByRole('textbox', { name: 'Description *', exact: true })
      .nth(index)
      .fill(item.description);
    await page
      .getByRole('textbox', { name: 'Amount *', exact: true })
      .nth(index)
      .fill(item.amount);
  }
}

export async function selectFrequency(
  page: Page,
  frequency: InvoiceScheduleFrequency,
) {
  await selectOption(page, 'Frequency *', frequency);
}

export async function selectEndType(page: Page, endType: EndType) {
  if (endType === 'never') {
    await page.getByRole('radio', { name: 'No end date' }).check();
    return;
  }

  await page
    .getByRole('radio', { name: 'End after a number of occurrences' })
    .check();
  await page
    .getByRole('textbox', { name: 'Number of occurrences *' })
    .fill(String(endType.occurrences));
}

function ordinal(day: number) {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${day}th`;
  }

  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] ?? 'th';
  return `${day}${suffix}`;
}

export const CUSTOM_CYCLE_FIRST_DAY = 5;

export async function selectCustomCycle(page: Page, firstDay: number) {
  await page.getByRole('radio', { name: 'Custom cycle' }).check();
  await selectOption(
    page,
    'First invoice raised on *',
    `${ordinal(firstDay)} of the month`,
  );
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastDayOfMonth(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

export function isDefaultCycleDay(date: Date) {
  return date.getUTCDate() === 15 || date.getUTCDate() === lastDayOfMonth(date);
}

export function isCustomCycleDay(date: Date) {
  const day = date.getUTCDate();
  return day === CUSTOM_CYCLE_FIRST_DAY || day === CUSTOM_CYCLE_FIRST_DAY + 14;
}

export async function pickStartDate(
  page: Page,
  isAllowed: (date: Date) => boolean = () => true,
) {
  const input = page.getByRole('textbox', {
    name: /^(Invoice|Start) date \*$/,
  });
  const min = await input.getAttribute('min');
  if (!min) {
    throw new Error('The date input has no min date');
  }

  const candidate = new Date(`${min}T00:00:00Z`);
  for (let attempt = 0; attempt < 62; attempt++) {
    if (isAllowed(candidate)) {
      await input.fill(isoDate(candidate));
      return candidate;
    }
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }

  throw new Error('No selectable start date in the next two months');
}

export async function submitSchedule(page: Page) {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.request().method() === 'POST' &&
      new URL(candidate.url()).pathname === CREATE_SCHEDULE_PATH,
  );
  await page.getByRole('button', { name: 'Create invoice schedule' }).click();
  return response;
}

export async function previewInvoice(page: Page) {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.request().method() === 'POST' &&
      PREVIEW_INVOICE_PATH.test(new URL(candidate.url()).pathname),
  );
  await page.getByRole('button', { name: 'Preview invoice' }).click();
  return response;
}
