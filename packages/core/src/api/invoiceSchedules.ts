import {
  getV1ContractorInvoiceSchedules,
  patchV1ContractorInvoiceSchedulesId2,
  postV1ContractorInvoiceSchedules,
  postV1EmploymentsEmploymentIdContractorInvoicesPreview,
} from '../client/sdk.gen';
import type {
  BulkContractorInvoiceScheduleCreateParams,
  BulkContractorInvoiceScheduleCreateResponse,
  ContractorInvoiceScheduleCreateParams,
  PreviewContractorInvoiceParams,
  UpdateScheduleContractorInvoiceParams,
} from '../client/types.gen';
import type { Client } from '../client/client';
import { INVOICE_SCHEDULE_STATUS } from '../domains/invoice-schedule/constants';
import {
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePayload,
} from '../domains/invoice-schedule/utils';
import type { FieldValues } from '../types';

export const invoiceSchedulesOptions = (
  client: Client,
  employmentId: string,
) => ({
  queryKey: ['contractor-invoice-schedules', employmentId] as const,
  queryFn: async () => {
    const response = await getV1ContractorInvoiceSchedules({
      client,
      query: { employment_id: employmentId },
    });

    if (response.error || !response.data) {
      throw new Error('Failed to fetch invoice schedules');
    }

    return response;
  },
});

type InvoiceSchedulesResponse = Awaited<
  ReturnType<ReturnType<typeof invoiceSchedulesOptions>['queryFn']>
>;

const EDITABLE_STATUSES: string[] = [
  INVOICE_SCHEDULE_STATUS.PENDING_CONTRACTOR_ACTION,
  INVOICE_SCHEDULE_STATUS.PROCESSING,
  INVOICE_SCHEDULE_STATUS.PENDING_COMPANY_ACTION,
];

export const selectExistingInvoiceSchedule = (
  response: InvoiceSchedulesResponse,
) =>
  response.data?.data?.contractor_invoice_schedules?.find((schedule) =>
    EDITABLE_STATUSES.includes(schedule.status),
  );

export const buildCreateInvoiceSchedulePayload = (
  employmentId: string,
  values: FieldValues,
) =>
  ({
    employment_id: employmentId,
    ...buildInvoiceSchedulePayload(values),
  }) as ContractorInvoiceScheduleCreateParams;

export const createInvoiceScheduleMutation = (client: Client) => ({
  mutationFn: async ({
    payload,
  }: {
    payload: ContractorInvoiceScheduleCreateParams;
  }) => {
    const body: BulkContractorInvoiceScheduleCreateParams = {
      contractor_invoice_schedules: [payload],
    };

    return postV1ContractorInvoiceSchedules({
      client,
      body,
    });
  },
});

export const updateInvoiceScheduleMutation = (client: Client) => ({
  mutationFn: async ({
    scheduleId,
    values,
  }: {
    scheduleId: string;
    values: FieldValues;
  }) => {
    const payload: UpdateScheduleContractorInvoiceParams =
      buildInvoiceSchedulePayload(values);

    return patchV1ContractorInvoiceSchedulesId2({
      client,
      path: { id: scheduleId },
      body: payload,
    });
  },
});

/**
 * Reads the outcome of a create-schedule call from the response body (`response.data` of the
 * raw response). Only the first success is read because the flow creates one schedule at a time.
 */
export const selectCreatedInvoiceSchedule = (
  body: BulkContractorInvoiceScheduleCreateResponse | undefined,
) => ({
  id: body?.data?.successes?.[0]?.id,
  hasFailures: Boolean(body?.data?.failures?.length),
});

export const skipInvoiceScheduleMutation = (client: Client) => ({
  mutationFn: async ({ scheduleId }: { scheduleId: string }) => {
    const payload: UpdateScheduleContractorInvoiceParams = {
      status: 'deleted',
    };

    return patchV1ContractorInvoiceSchedulesId2({
      client,
      path: { id: scheduleId },
      body: payload,
    });
  },
});

export const previewContractorInvoiceMutation = (client: Client) => ({
  mutationFn: async ({
    employmentId,
    values,
  }: {
    employmentId: string;
    values: FieldValues;
  }) => {
    const payload = buildInvoicePreviewPayload(
      values,
    ) as PreviewContractorInvoiceParams;

    return postV1EmploymentsEmploymentIdContractorInvoicesPreview({
      client,
      path: { employment_id: employmentId },
      body: payload,
    });
  },
});
