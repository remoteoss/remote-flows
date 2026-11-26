import { createElement, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDeepStable } from '@/src/common/hooks';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { useContractorCurrenciesOptions } from '@/src/common/api/contractor-contract-details';
import { useIdentity } from '@/src/common/api/identity';
import { InvoiceNumberSequenceLink } from '@/src/common/invoice-schedules/components/InvoiceNumberSequence/InvoiceNumberSequenceLink';
import { InvoiceNumberSequenceBanner } from '@/src/common/invoice-schedules/components/InvoiceNumberSequence/InvoiceNumberSequenceBanner';
import { JSFModify } from '@/src/flows/types';
import { createClientMutation, withClient } from '@/src/lib/withClient';
import {
  buildCreateInvoiceScheduleSchema,
  contractorInvoiceSequenceOptions,
  createInvoiceScheduleMutation,
  INVOICE_NUMBER_SEQUENCE_FIELD,
  invoiceSchedulesOptions as invoiceSchedulesOptionsCore,
  previewContractorInvoiceMutation,
  selectContractorCurrencyCodes,
  selectExistingInvoiceSchedule,
  selectInvoiceNumberSequenceText,
  skipInvoiceScheduleMutation,
  updateInvoiceScheduleMutation,
} from '@remoteoss/remote-flows-core';

const useContractorInvoiceSequenceOptions = withClient(
  contractorInvoiceSequenceOptions,
);

const useInvoiceNumberSequenceText = ({ enabled }: { enabled?: boolean }) =>
  useQuery({
    ...useContractorInvoiceSequenceOptions(),
    enabled,
    select: selectInvoiceNumberSequenceText,
  });

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
  const { data: currencies, isLoading } = useQuery({
    ...useContractorCurrenciesOptions(employmentId as string),
    enabled: enabled && Boolean(employmentId),
    select: selectContractorCurrencyCodes,
  });

  const { data: invoiceNumberSequence, isLoading: isLoadingSequence } =
    useInvoiceNumberSequenceText({ enabled });

  const { isPending } = useIdentity({ enabled });
  const isPendingIdentity = Boolean(enabled) && isPending;

  const schema = useMemo(() => {
    // The form is built once, so wait until the sequence and the identity behind the
    // number field's link are known.
    if (isLoadingSequence || isPendingIdentity) {
      return undefined;
    }

    // Callers know their employment up front, so there is always a currency list on the
    // way — render nothing until it arrives rather than a currency field with no options.
    if (!enabled || !currencies) {
      return undefined;
    }

    return buildCreateInvoiceScheduleSchema({
      currencies,
      isContractorOfRecord,
      includeFieldsets,
      invoiceNumberSequence: invoiceNumberSequence ?? undefined,
    });
  }, [
    enabled,
    currencies,
    isContractorOfRecord,
    includeFieldsets,
    invoiceNumberSequence,
    isLoadingSequence,
    isPendingIdentity,
  ]);

  const stableJsfModify = useDeepStable(jsfModify);

  const modifyWithSequenceUi = useMemo(() => {
    const bannerField =
      stableJsfModify?.fields?.[INVOICE_NUMBER_SEQUENCE_FIELD];

    return {
      ...stableJsfModify,
      fields: {
        ...stableJsfModify?.fields,
        number: {
          ...stableJsfModify?.fields?.number,
          presentation: {
            ...stableJsfModify?.fields?.number?.presentation,
            description: () => createElement(InvoiceNumberSequenceLink),
          },
        },
        ...(invoiceNumberSequence
          ? {
              [INVOICE_NUMBER_SEQUENCE_FIELD]: {
                ...bannerField,
                presentation: {
                  Component: InvoiceNumberSequenceBanner,
                  ...bannerField?.presentation,
                },
              },
            }
          : {}),
      },
    };
  }, [stableJsfModify, invoiceNumberSequence]);

  const headlessForm = useHeadlessForm({
    schema,
    initialValues,
    options: { jsfModify: modifyWithSequenceUi },
    strategy: 'buildOnce',
  });

  return {
    data: headlessForm.form,
    handleValidation: headlessForm.handleValidation,
    onValuesChange: headlessForm.onValuesChange,
    parseFormValues: headlessForm.parseFormValues,
    isLoading: isLoading || isLoadingSequence || isPendingIdentity,
  };
};

export const useInvoiceSchedulesOptions = withClient(
  invoiceSchedulesOptionsCore,
);

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
  return useQuery({
    ...useInvoiceSchedulesOptions(employmentId),
    enabled: options?.queryOptions?.enabled,
    select: selectExistingInvoiceSchedule,
  });
};

/**
 * Creates contractor invoice schedules
 * @param employmentId - The employment ID
 * @param values - The form values containing invoice schedule data
 * @returns The created invoice schedules
 */
export const useCreateInvoiceSchedule = createClientMutation(
  createInvoiceScheduleMutation,
);

/**
 * Updates an existing contractor invoice schedule
 * @param scheduleId - The invoice schedule ID
 * @param values - The form values containing invoice schedule data
 * @returns The updated invoice schedule
 */
export const useUpdateInvoiceSchedule = createClientMutation(
  updateInvoiceScheduleMutation,
);

/**
 * Skips (cancels) an existing contractor invoice schedule by marking it as deleted.
 * @param scheduleId - The invoice schedule ID
 * @returns The updated invoice schedule
 */
export const useSkipInvoiceSchedule = createClientMutation(
  skipInvoiceScheduleMutation,
);

/**
 * Previews a contractor invoice as a draft PDF, without persisting it.
 * @param employmentId - The employment ID
 * @param values - The form values containing invoice details
 * @returns The base64-encoded PDF preview
 */
export const usePreviewContractorInvoice = createClientMutation(
  previewContractorInvoiceMutation,
);
