import { useMemo } from 'react';
import { useMutation, useQuery, queryOptions } from '@tanstack/react-query';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { useContractorCurrencies } from '@/src/common/api/contractor-contract-details';
import { JSFModify } from '@/src/flows/types';
import {
  buildCreateInvoiceScheduleSchema,
  createInvoiceScheduleMutation,
  INVOICE_SCHEDULE_STATUS,
  invoiceSchedulesOptions as invoiceSchedulesOptionsCore,
  previewContractorInvoiceMutation,
  skipInvoiceScheduleMutation,
  updateInvoiceScheduleMutation,
} from '@remoteoss/remote-flows-core';

type UseGetCreateInvoiceScheduleSchemaParams = {
  enabled?: boolean;
  employmentId?: string;
  jsfModify?: JSFModify;
  /**
   * Restrict to one-off only, as the platform does for Contractor of Record.
   */
  isContractorOfRecord?: boolean;
  /**
   * Group the fields under the platform's headings. Off for the standalone flow.
   */
  includeFieldsets?: boolean;
  /**
   * Saved values in API units (item amounts in cents). They seed the first build so the item
   * rows a saved schedule needs are visible before the step mounts.
   */
  initialValues?: Record<string, unknown>;
};

/**
 * Get the create invoice schedule form, with currency options from the contractor
 * currencies endpoint. React Query caches the result, so multiple calls share the same data.
 *
 * The form is built once through `useHeadlessForm`; validation resolves the conditionals.
 */
export const useGetCreateInvoiceScheduleSchema = ({
  enabled,
  employmentId,
  jsfModify,
  isContractorOfRecord,
  includeFieldsets,
  initialValues,
}: UseGetCreateInvoiceScheduleSchemaParams) => {
  const { data: currencies, isLoading } = useContractorCurrencies({
    employmentId: employmentId as string,
    options: {
      queryOptions: { enabled: enabled && Boolean(employmentId) },
    },
  });

  const schema = useMemo(() => {
    // Callers know their employment up front, so there is always a currency list on the
    // way — render nothing until it arrives rather than a currency field with no options.
    if (!enabled || !currencies) {
      return undefined;
    }

    return buildCreateInvoiceScheduleSchema({
      currencies: currencies.map(
        (currency: { code: string; source: string }) => currency.code,
      ),
      isContractorOfRecord,
      includeFieldsets,
    });
  }, [enabled, currencies, isContractorOfRecord, includeFieldsets]);

  const headlessForm = useHeadlessForm({
    schema,
    initialValues,
    options: { jsfModify },
    strategy: 'buildOnce',
  });

  return {
    data: headlessForm.form,
    handleValidation: headlessForm.handleValidation,
    onValuesChange: headlessForm.onValuesChange,
    parseFormValues: headlessForm.parseFormValues,
    isLoading,
  };
};

/**
 * Query options factory for fetching invoice schedules by employment id
 * @param client - The API client
 * @param employmentId - The employment ID
 * @returns Query options for contractor invoice schedules
 */
export const invoiceSchedulesOptions = (client: Client, employmentId: string) =>
  queryOptions(invoiceSchedulesOptionsCore(client, employmentId));

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
  return useMutation(createInvoiceScheduleMutation(client as Client));
};

/**
 * Updates an existing contractor invoice schedule
 * @param scheduleId - The invoice schedule ID
 * @param values - The form values containing invoice schedule data
 * @returns The updated invoice schedule
 */
export const useUpdateInvoiceSchedule = () => {
  const { client } = useClient();
  return useMutation(updateInvoiceScheduleMutation(client as Client));
};

/**
 * Skips (cancels) an existing contractor invoice schedule by marking it as deleted.
 * @param scheduleId - The invoice schedule ID
 * @returns The updated invoice schedule
 */
export const useSkipInvoiceSchedule = () => {
  const { client } = useClient();
  return useMutation(skipInvoiceScheduleMutation(client as Client));
};

/**
 * Previews a contractor invoice as a draft PDF, without persisting it.
 * @param employmentId - The employment ID
 * @param values - The form values containing invoice details
 * @returns The base64-encoded PDF preview
 */
export const usePreviewContractorInvoice = () => {
  const { client } = useClient();
  return useMutation(previewContractorInvoiceMutation(client as Client));
};
