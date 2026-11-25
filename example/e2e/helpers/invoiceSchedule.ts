import { Page } from '@playwright/test';
import { fillRadio, fillSelect, fillTextField } from './general';

export const CREATE_SCHEDULE_PATH = '/v1/contractor-invoice-schedules';

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
) {
  await page.goto('/?demo=invoice-schedule');
  await page.getByLabel('Employment ID:').fill(employmentId);
  await page.getByRole('button', { name: 'Create invoice schedule' }).click();
  await page
    .getByRole('heading', { name: 'Create invoice schedule' })
    .waitFor({ state: 'visible' });
}

export async function selectCurrency(page: Page, code: string) {
  await fillSelect(page, code, 'currency', { exact: true });
}

export async function fillInvoiceItems(page: Page, items: InvoiceItem[]) {
  for (const [index, item] of items.entries()) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Add item' }).click();
    }
    await fillTextField(page, `items.${index}.description`, item.description);
    await fillTextField(page, `items.${index}.amount`, item.amount);
  }
}

export async function selectFrequency(
  page: Page,
  frequency: InvoiceScheduleFrequency,
) {
  await fillSelect(page, frequency, 'periodicity', { exact: true });
}

export async function selectEndType(page: Page, endType: EndType) {
  if (endType === 'never') {
    await fillRadio(page, 'never', 'end_type');
    return;
  }

  await fillRadio(page, 'multiple', 'end_type');
  await fillTextField(page, 'nr_occurrences', String(endType.occurrences));
}

function ordinal(day: number) {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${day}th`;
  }

  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] ?? 'th';
  return `${day}${suffix}`;
}

export async function selectCustomCycle(page: Page, firstDay: number) {
  await fillRadio(
    page,
    'custom_cycle',
    'semi_monthly_settings.invoicing_cycle',
  );
  await fillSelect(
    page,
    `${ordinal(firstDay)} of the month`,
    'semi_monthly_settings.first_invoice_day',
    { exact: true },
  );
}

export function defaultCycleDays(today = new Date()) {
  const lastDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return [15, lastDay];
}

export function customCycleFirstDay(today = new Date()) {
  const day = today.getUTCDate();
  if (day <= 14) {
    return day;
  }

  return day <= 28 ? day - 14 : 1;
}

export async function pickStartDate(page: Page, allowedDays?: number[]) {
  await page.getByTestId('date-picker-button-start_date').click();
  await page
    .locator('[role="dialog"] button[role="gridcell"]')
    .first()
    .waitFor({ state: 'visible' });
  const days = page.locator(
    '[role="dialog"] button[role="gridcell"]:not([disabled])',
  );

  const labels = await days.allInnerTexts();
  if (labels.length === 0) {
    throw new Error('The start date calendar has no selectable day');
  }

  const index = allowedDays
    ? labels.findIndex((label) => allowedDays.includes(Number(label)))
    : 0;
  if (index === -1) {
    return false;
  }

  await days.nth(index).click();
  return true;
}

export async function submitSchedule(page: Page) {
  const response = page.waitForResponse(
    (candidate) =>
      candidate.request().method() === 'POST' &&
      new URL(candidate.url()).pathname === CREATE_SCHEDULE_PATH,
  );
  await page.getByRole('button', { name: 'Create schedule' }).click();
  return response;
}
