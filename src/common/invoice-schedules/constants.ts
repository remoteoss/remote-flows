/**
 * Invoice schedule status values
 * Based on ContractorInvoiceScheduleStatus from the API
 */
export const INVOICE_SCHEDULE_STATUS = {
  PENDING_CONTRACTOR_ACTION: 'pending_contractor_action',
  PROCESSING: 'processing',
  PENDING_COMPANY_ACTION: 'pending_company_action',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  GENERATION_FAILED_UNRELATED_TO_WITHDRAWAL_METHOD:
    'generation_failed_unrelated_to_withdrawal_method',
  DELETED: 'deleted',
} as const;

/**
 * Number of invoice item slots the hardcoded schema exposes.
 * Matches the API's `maxItems: 10` on `contractor_invoice_schedules[].items`.
 */
export const INVOICE_ITEM_SLOTS = 10;

/**
 * The recurring cadences the API's `periodicity` enum accepts.
 */
export const RECURRING_PERIODICITY_OPTIONS = [
  { const: 'weekly', title: 'Weekly' },
  { const: 'bi_weekly', title: 'Bi-weekly' },
  { const: 'semi_monthly', title: 'Semi-monthly' },
  { const: 'monthly', title: 'Monthly' },
] as const;

/**
 * A one-off schedule is not a periodicity on the API — it is `nr_occurrences: 1`
 * paired with any cadence. We surface it as a periodicity choice because that is how
 * both the Remote platform and users think about it, and collapse it back to
 * `monthly` + `nr_occurrences: 1` when building the payload.
 *
 * See `buildInvoiceSchedulePayload`.
 */
export const ONE_TIME_PERIODICITY = 'one_time';

export const ONE_TIME_PERIODICITY_OPTION = {
  const: ONE_TIME_PERIODICITY,
  title: 'One time',
} as const;

/**
 * The cadence a one-off schedule is persisted as. Arbitrary but harmless: the schedule
 * completes after its single invoice, so it never recurs.
 */
export const ONE_TIME_PERSISTED_PERIODICITY = 'monthly';
