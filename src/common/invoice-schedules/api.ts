import { useMemo } from 'react';
import { useMutation, useQuery, queryOptions } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import {
  BulkContractorInvoiceScheduleCreateParams,
  ContractorInvoiceScheduleCreateParams,
  getV1ContractorInvoiceSchedules,
  patchV1ContractorInvoiceSchedulesId2,
  postV1ContractorInvoiceSchedules,
  postV1EmploymentsEmploymentIdContractorInvoicesPreview,
  PreviewContractorInvoiceParams,
  UpdateScheduleContractorInvoiceParams,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useContractorCurrencies } from '@/src/common/api/contractor-contract-details';
import { INVOICE_SCHEDULE_STATUS } from '@/src/common/invoice-schedules/constants';
import {
  buildCreateInvoiceScheduleSchema,
  ContractorOption,
} from '@/src/common/invoice-schedules/json-schema';
import {
  buildInvoicePreviewPayload,
  buildInvoiceSchedulePayload,
} from '@/src/common/invoice-schedules/utils';
import {
  JSONSchemaFormResultWithFieldsets,
  JSFModify,
} from '@/src/flows/types';

/**
 * Get the create invoice schedule schema with currency options from the contractor currencies endpoint.
 * React Query caches the result, so multiple calls share the same data.
 */
export const useGetCreateInvoiceScheduleSchema = ({
  enabled,
  employmentId,
  jsfModify,
  includeOneTime,
  isContractorOfRecord,
  includeContractorSelect,
  contractors,
}: {
  enabled?: boolean;
  employmentId?: string;
  jsfModify?: JSFModify;
  /**
   * Offer "One time" alongside the recurring cadences. Off by default so the in-flow
   * onboarding step keeps the field set it shipped with.
   */
  includeOneTime?: boolean;
  /**
   * Restrict to one-off only, as the platform does for Contractor of Record.
   */
  isContractorOfRecord?: boolean;
  /**
   * Prepend a contractor picker, for the standalone screen.
   */
  includeContractorSelect?: boolean;
  /**
   * Contractors to offer in the picker.
   */
  contractors?: ContractorOption[];
}): { data: JSONSchemaFormResultWithFieldsets | null; isLoading: boolean } => {
  const { data: currencies, isLoading: isLoadingCurrencies } =
    useContractorCurrencies({
      employmentId: employmentId as string,
      options: {
        queryOptions: { enabled: enabled && Boolean(employmentId) },
      },
    });

  const schemaWithCurrencies = useMemo(() => {
    if (!enabled) return null;

    // The standalone screen picks the contractor in this very form, so the currencies cannot
    // be known on first render — build the schema anyway and let the currency field show its
    // placeholder until a contractor is chosen. The in-flow step always knows its employment,
    // so it keeps waiting for currencies and renders nothing until they arrive.
    if (!currencies && !includeContractorSelect) return null;

    const schema = buildCreateInvoiceScheduleSchema({
      currencies: currencies?.map(
        (currency: { code: string; source: string }) => currency.code,
      ),
      includeOneTime,
      isContractorOfRecord,
      includeContractorSelect,
      contractors,
    });

    return createHeadlessForm(schema, {}, { jsfModify });
  }, [
    enabled,
    currencies,
    jsfModify,
    includeOneTime,
    isContractorOfRecord,
    includeContractorSelect,
    contractors,
  ]);

  return {
    data: schemaWithCurrencies,
    isLoading: isLoadingCurrencies,
  };
};

/**
 * Query options factory for fetching invoice schedules by employment id
 * @param client - The API client
 * @param employmentId - The employment ID
 * @returns Query options for contractor invoice schedules
 */
export const invoiceSchedulesOptions = (
  client: Client,
  employmentId: string,
) => {
  return queryOptions({
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
};

/**
 * Get the last invoice schedule for an employment that matches specific statuses.
 * This is used to determine if a schedule was previously created during onboarding.
 *
 * @param employmentId - The employment ID
 * @param options - Query options
 * @returns The last matching invoice schedule or undefined
 */
export const useGetExistingInvoiceSchedule = ({
  employmentId,
  options,
}: {
  employmentId: string;
  options?: { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  return useQuery({
    ...invoiceSchedulesOptions(client as Client, employmentId),
    enabled: options?.queryOptions?.enabled,
    select: (response) => {
      // Find the first invoice schedule that matches the editing criteria
      return response.data?.data?.contractor_invoice_schedules?.find(
        (invoice) =>
          invoice.status ===
            INVOICE_SCHEDULE_STATUS.PENDING_CONTRACTOR_ACTION ||
          invoice.status === INVOICE_SCHEDULE_STATUS.PROCESSING ||
          invoice.status === INVOICE_SCHEDULE_STATUS.PENDING_COMPANY_ACTION,
      );
    },
  });
};

/**
 * Creates contractor invoice schedules
 * @param employmentId - The employment ID
 * @param values - The form values containing invoice schedule data
 * @returns The created invoice schedules
 */
export const useCreateInvoiceSchedule = () => {
  const { client } = useClient();
  return useMutation({
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
        client: client as Client,
        body: payload,
      });
    },
  });
};

/**
 * Updates an existing contractor invoice schedule
 * @param scheduleId - The invoice schedule ID
 * @param values - The form values containing invoice schedule data
 * @returns The updated invoice schedule
 */
export const useUpdateInvoiceSchedule = () => {
  const { client } = useClient();
  return useMutation({
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
        client: client as Client,
        path: { id: scheduleId },
        body: payload,
      });
    },
  });
};

/**
 * Skips (cancels) an existing contractor invoice schedule by marking it as deleted.
 * @param scheduleId - The invoice schedule ID
 * @returns The updated invoice schedule
 */
export const useSkipInvoiceSchedule = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({ scheduleId }: { scheduleId: string }) => {
      const payload: UpdateScheduleContractorInvoiceParams = {
        status: 'deleted',
      };

      return patchV1ContractorInvoiceSchedulesId2({
        client: client as Client,
        path: { id: scheduleId },
        body: payload,
      });
    },
  });
};

/**
 * Previews a contractor invoice as a draft PDF, without persisting it.
 * @param employmentId - The employment ID
 * @param values - The form values containing invoice details
 * @returns The base64-encoded PDF preview
 */
export const usePreviewContractorInvoice = () => {
  const { client } = useClient();
  return useMutation({
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
        client: client as Client,
        path: { employment_id: employmentId },
        body: payload,
      });
    },
  });
};
