import {
  getV1ContractorInvoiceSchedules,
  patchV1ContractorInvoiceSchedulesId2,
  postV1ContractorInvoiceSchedules,
  postV1EmploymentsEmploymentIdContractorInvoicesPreview,
} from '../client/sdk.gen';
import type {
  BulkContractorInvoiceScheduleCreateParams,
  ContractorInvoiceScheduleCreateParams,
  PreviewContractorInvoiceParams,
  UpdateScheduleContractorInvoiceParams,
} from '../client/types.gen';
import type { Client } from '../client/client';
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

export const createInvoiceScheduleMutation = (client: Client) => ({
  mutationFn: async ({
    employmentId,
    values,
  }: {
    employmentId: string;
    values: FieldValues;
  }) => {
    const payload: BulkContractorInvoiceScheduleCreateParams = {
      contractor_invoice_schedules: [
        {
          employment_id: employmentId,
          ...buildInvoiceSchedulePayload(values),
        } as ContractorInvoiceScheduleCreateParams,
      ],
    };

    return postV1ContractorInvoiceSchedules({
      client,
      body: payload,
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
