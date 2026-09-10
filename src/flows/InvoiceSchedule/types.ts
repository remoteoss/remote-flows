import { FieldValues } from 'react-hook-form';
import { BulkContractorInvoiceScheduleCreateResponse } from '@/src/client';
import { JSFModify } from '@/src/flows/types';

/**
 * Values the invoice-schedule form collects. The contractor is not among them — the flow is
 * told which one it is acting on through `employmentId`.
 */
export type InvoiceScheduleFormValues = FieldValues & {
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
   * The contractor to create the schedule for.
   */
  employmentId: string;
  /**
   * Modify the generated JSON-schema form fields.
   */
  jsfModify?: JSFModify;
};
