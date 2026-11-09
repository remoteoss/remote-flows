import { inject, InjectionToken, Signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  BulkContractorInvoiceScheduleCreateParams,
  ContractorInvoiceScheduleCreateParams,
  getV1ContractorsEmploymentsEmploymentIdContractorCurrencies,
  getV1EmploymentsEmploymentId,
  postV1ContractorInvoiceSchedules,
  postV1EmploymentsEmploymentIdContractorInvoicesPreview,
  PreviewContractorInvoiceParams,
} from '@/src/client';
import { Client } from '@/src/client/client';
import {
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePayload,
} from '@/src/common/invoice-schedules/utils';

export const REMOTE_CLIENT = new InjectionToken<Client>('REMOTE_CLIENT');

type Values = Record<string, unknown>;

export class RemoteApiError extends Error {
  constructor(readonly payload: unknown) {
    super(describeError(payload));
  }
}

function describeError(payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const { message, errors } = payload as {
      message?: unknown;
      errors?: unknown;
    };
    if (typeof message === 'string') {
      return message;
    }
    if (errors) {
      return JSON.stringify(errors);
    }
  }
  return JSON.stringify(payload);
}

function unwrap<T extends { data?: unknown; error?: unknown }>(response: T) {
  if (response.error || !response.data) {
    throw new RemoteApiError(response.error);
  }
  return { data: response.data as NonNullable<T['data']> };
}

export function injectContractorCurrencies(employmentId: Signal<string>) {
  const client = inject(REMOTE_CLIENT);
  return injectQuery(() => ({
    queryKey: ['contractor-currencies', employmentId()],
    enabled: Boolean(employmentId()),
    queryFn: async () =>
      unwrap(
        await getV1ContractorsEmploymentsEmploymentIdContractorCurrencies({
          client,
          path: { employment_id: employmentId() },
          query: { restrict_to_guaranteed_pay_out_currencies: false },
        }),
      ),
    select: ({ data }) => data?.data,
  }));
}

export function injectEmployment(employmentId: Signal<string>) {
  const client = inject(REMOTE_CLIENT);
  return injectQuery(() => ({
    queryKey: ['employment', employmentId()],
    enabled: Boolean(employmentId()),
    retry: false,
    queryFn: async () =>
      unwrap(
        await getV1EmploymentsEmploymentId({
          client,
          headers: { Authorization: '' },
          path: { employment_id: employmentId() },
        }),
      ),
    select: ({ data }) => data?.data?.employment,
  }));
}

export function injectCreateInvoiceSchedule() {
  const client = inject(REMOTE_CLIENT);
  return injectMutation(() => ({
    mutationFn: async ({
      employmentId,
      values,
    }: {
      employmentId: string;
      values: Values;
    }) => {
      const body: BulkContractorInvoiceScheduleCreateParams = {
        contractor_invoice_schedules: [
          {
            employment_id: employmentId,
            ...buildInvoiceSchedulePayload(values),
          } as ContractorInvoiceScheduleCreateParams,
        ],
      };
      const response = unwrap(
        await postV1ContractorInvoiceSchedules({ client, body }),
      );
      if (response.data?.data?.failures?.length) {
        throw new RemoteApiError(response.data.data.failures);
      }
      return response;
    },
  }));
}

export function injectPreviewContractorInvoice() {
  const client = inject(REMOTE_CLIENT);
  return injectMutation(() => ({
    mutationFn: async ({
      employmentId,
      values,
    }: {
      employmentId: string;
      values: Values;
    }) =>
      unwrap(
        await postV1EmploymentsEmploymentIdContractorInvoicesPreview({
          client,
          path: { employment_id: employmentId },
          body: buildInvoicePreviewPayload(
            values,
          ) as PreviewContractorInvoiceParams,
        }),
      ),
  }));
}
