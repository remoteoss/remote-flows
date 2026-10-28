import {
  ContractorInvoiceSchedule,
  ContractorInvoiceScheduleItem,
} from '@/src/client';
import {
  END_TYPE_MULTIPLE,
  END_TYPE_NEVER,
  INVOICE_ITEM_SLOTS,
  ONE_TIME_PERIODICITY,
  ONE_TIME_PERSISTED_PERIODICITY,
  SEMI_MONTHLY_CUSTOM_CYCLE,
  SEMI_MONTHLY_CYCLE_GAP_DAYS,
  SEMI_MONTHLY_DEFAULT_CYCLE_DAYS,
  SEMI_MONTHLY_PERIODICITY,
} from '@/src/common/invoice-schedules/constants';

/**
 * Builds invoice items array from form values
 * Collects up to 10 invoice items (item_1 through item_10)
 * @param values - Form values containing item_N_description and item_N_amount fields
 * @returns Array of invoice items with description and amount
 */
export function buildInvoiceItems(values: Record<string, unknown>) {
  const items = [];
  for (let i = 1; i <= INVOICE_ITEM_SLOTS; i++) {
    const description = values[`item_${i}_description`];
    const amount = values[`item_${i}_amount`];
    if (typeof description === 'string' && typeof amount === 'number') {
      items.push({
        description,
        amount: amount,
      });
    }
  }
  return items;
}

type InvoiceScheduleFormSource = Pick<
  ContractorInvoiceSchedule,
  | 'currency'
  | 'periodicity'
  | 'start_date'
  | 'number'
  | 'note'
  | 'nr_occurrences'
> & {
  items?: Pick<ContractorInvoiceScheduleItem, 'description' | 'amount'>[];
};

/**
 * Turns a saved invoice schedule into form values in API units, with item amounts in cents.
 * @param schedule - The schedule as the API returns it
 * @returns Values keyed by form field name, ready to seed the form
 */
export function buildInvoiceScheduleFormValues(
  schedule: InvoiceScheduleFormSource,
) {
  const isOneTime =
    schedule.periodicity === ONE_TIME_PERSISTED_PERIODICITY &&
    schedule.nr_occurrences === 1;

  const values: Record<string, unknown> = {
    currency: schedule.currency,
    periodicity: isOneTime ? ONE_TIME_PERIODICITY : schedule.periodicity,
    start_date: schedule.start_date,
    number: schedule.number,
    note: schedule.note,
    end_type: isOneTime
      ? undefined
      : schedule.nr_occurrences
        ? END_TYPE_MULTIPLE
        : END_TYPE_NEVER,
    nr_occurrences: isOneTime ? undefined : schedule.nr_occurrences,
  };

  schedule.items?.forEach((item, index) => {
    values[`item_${index + 1}_description`] = item.description;
    values[`item_${index + 1}_amount`] = item.amount;
  });

  return values;
}

/**
 * Resolves the `periodicity` / `nr_occurrences` pair the API expects.
 *
 * The API has no `one_time` periodicity: a one-off schedule is `nr_occurrences: 1` paired
 * with any cadence. Recurrence lives on `nr_occurrences` — 1 for a one-off, omitted to repeat
 * indefinitely, N to cap it — and this is the encoding the Remote platform and Remote's bulk
 * invoice-schedule upload both use, so a one-off created here is indistinguishable from one
 * created there.
 *
 * @param values - Form values containing `periodicity` and optionally `nr_occurrences`
 */
export function buildRecurrence(values: Record<string, unknown>): {
  periodicity: unknown;
  nr_occurrences?: number;
} {
  if (values.periodicity === ONE_TIME_PERIODICITY) {
    return {
      periodicity: ONE_TIME_PERSISTED_PERIODICITY,
      nr_occurrences: 1,
    };
  }

  return values.nr_occurrences
    ? {
        periodicity: values.periodicity,
        nr_occurrences: Number(values.nr_occurrences),
      }
    : { periodicity: values.periodicity };
}

/**
 * Resolves the two calendar days a semi-monthly schedule generates invoices on.
 *
 * Only meaningful for `semi_monthly`. The default cycle is the 15th and the last day of the
 * month; a custom cycle is the chosen first day and the day 14 days after it.
 *
 * Note `custom_days` is not yet in the generated client's create params — it arrives with
 * the next `pnpm run openapi-ts` once the API change exposing it is deployed. Until then the
 * payload carries it and the API ignores it, so a semi-monthly schedule falls back to the
 * cycle derived from `start_date` — the behaviour before this field existed.
 *
 * @param values - Form values containing `periodicity` and the `semi_monthly_settings` group
 */
export function buildCustomDays(
  values: Record<string, unknown>,
): [number, number] | undefined {
  if (values.periodicity !== SEMI_MONTHLY_PERIODICITY) {
    return undefined;
  }

  const settings = values.semi_monthly_settings as
    | Record<string, unknown>
    | undefined;

  if (!settings) {
    return undefined;
  }

  if (settings.invoicing_cycle !== SEMI_MONTHLY_CUSTOM_CYCLE) {
    return SEMI_MONTHLY_DEFAULT_CYCLE_DAYS;
  }

  const first = Number(settings.first_invoice_day);

  if (!first) {
    return undefined;
  }

  return [first, first + SEMI_MONTHLY_CYCLE_GAP_DAYS];
}

/**
 * Formats a day of the month as an ordinal, e.g. 1 → "1st", 22 → "22nd", 13 → "13th".
 */
export function toOrdinal(day: number): string {
  const lastTwoDigits = day % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${day}th`;
  }

  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${day}${suffixes[day % 10] ?? 'th'}`;
}

/**
 * Builds the base invoice schedule payload from form values
 * @param values - Form values containing invoice schedule data
 * @returns Invoice schedule payload object
 */
export function buildInvoiceSchedulePayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const { periodicity, nr_occurrences } = buildRecurrence(values);

  const payload: Record<string, unknown> = {
    currency: values.currency,
    periodicity,
    start_date: values.start_date,
    items: buildInvoiceItems(values),
  };

  if (values.number) {
    payload.number = String(values.number);
  }

  if (values.note) {
    payload.note = values.note;
  }

  if (nr_occurrences) {
    payload.nr_occurrences = nr_occurrences;
  }

  const customDays = buildCustomDays(values);
  if (customDays) {
    payload.custom_days = customDays;
  }

  return payload;
}

/**
 * Builds the payload for previewing a contractor invoice from form values.
 * Unlike buildInvoiceSchedulePayload, the preview endpoint previews a single
 * invoice, not a recurring schedule, so it doesn't accept periodicity or
 * nr_occurrences.
 * @param values - Form values containing invoice schedule data
 * @returns Invoice preview payload object
 */
export function buildInvoicePreviewPayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    currency: values.currency,
    start_date: values.start_date,
    items: buildInvoiceItems(values),
  };

  if (values.number) {
    payload.number = String(values.number);
  }

  if (values.note) {
    payload.note = values.note;
  }

  return payload;
}
