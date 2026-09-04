import {
  INVOICE_ITEM_SLOTS,
  ONE_TIME_PERIODICITY,
  ONE_TIME_PERSISTED_PERIODICITY,
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
