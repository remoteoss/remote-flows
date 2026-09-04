import { FieldValues } from 'react-hook-form';
import { BulkContractorInvoiceScheduleCreateResponse } from '@/src/client';
import { Contractor } from '@/src/flows/InvoiceSchedule/api';
import { JSFModify } from '@/src/flows/types';

export type { Contractor } from '@/src/flows/InvoiceSchedule/api';

/**
 * Values the invoice-schedule form collects. `employment_id` is only present when the flow
 * renders its own contractor picker.
 */
export type InvoiceScheduleFormValues = FieldValues & {
  employment_id?: string;
  currency?: string;
  periodicity?: string;
  start_date?: string;
  number?: string;
  note?: string;
  nr_occurrences?: number;
};

/**
 * The payload sent to `POST /v1/contractor-invoice-schedules`, after the one-off periodicity
 * has been collapsed to `monthly` + `nr_occurrences: 1` and item slots gathered into `items`.
 */
export type InvoiceSchedulePayload = {
  employment_id: string;
  currency: unknown;
  periodicity: unknown;
  start_date: unknown;
  items: { description: string; amount: number }[];
  number?: string;
  note?: unknown;
  nr_occurrences?: number;
};

export type InvoiceScheduleResponse =
  BulkContractorInvoiceScheduleCreateResponse;

export type UseInvoiceScheduleOptions = {
  /**
   * Create the schedule for this contractor and skip the picker. Omit to have the flow load
   * the company's active contractors and render a picker as the first field.
   */
  employmentId?: string;
  /**
   * Modify the generated JSON-schema form fields.
   */
  jsfModify?: JSFModify;
};

export type InvoiceScheduleContractorsState = {
  /**
   * Active contractors available in the picker.
   */
  contractors: Contractor[];
  /**
   * Total the API reports. Exceeds `contractors.length` when the list was truncated.
   */
  totalCount: number;
  /**
   * True when not every contractor could be loaded, so the picker shows a subset.
   */
  isTruncated: boolean;
};
