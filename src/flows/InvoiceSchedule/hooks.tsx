import { useCallback, useMemo, useState } from 'react';
import {
  useCreateInvoiceSchedule,
  useGetCreateInvoiceScheduleSchema,
} from '@/src/common/invoice-schedules/api';
import { buildInvoiceSchedulePayload } from '@/src/common/invoice-schedules/utils';
import { useEmploymentQuery } from '@/src/common/api/employment';
import { useContractors } from '@/src/flows/InvoiceSchedule/api';
import {
  InvoiceScheduleFormValues,
  InvoiceSchedulePayload,
  UseInvoiceScheduleOptions,
} from '@/src/flows/InvoiceSchedule/types';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  Fields,
  ValidationResult,
} from '@remoteoss/remote-json-schema-form-kit';

/**
 * Headless hook powering the standalone invoice-schedule screen.
 *
 * Mirrors the platform's single-screen "Create invoice schedule" modal: one form render, one
 * submission, for a contractor chosen in the form itself. Pass `employmentId` to target a
 * known contractor and drop the picker.
 */
export const useInvoiceSchedule = ({
  employmentId,
  jsfModify,
}: UseInvoiceScheduleOptions = {}) => {
  // When the flow owns the picker, the selected contractor drives the currency options and the
  // Contractor-of-Record restriction, so it has to live in state rather than only in the form.
  const [selectedEmploymentId, setSelectedEmploymentId] = useState<
    string | undefined
  >(employmentId);

  const rendersContractorSelect = !employmentId;

  const {
    data: contractorsResult,
    isLoading: isLoadingContractors,
    error: contractorsError,
  } = useContractors({
    queryOptions: { enabled: rendersContractorSelect },
  });

  // `contractor_type` is not on the employments list payload, so the individual employment is
  // fetched once a contractor is known, purely to tell Contractor of Record apart.
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({
      employmentId: selectedEmploymentId as string,
      enabled: Boolean(selectedEmploymentId),
    });

  const isContractorOfRecord =
    (employment as $TSFixMe)?.contractor_type === 'cor';

  const contractors = useMemo(
    () =>
      (contractorsResult?.contractors ?? []).map(({ id, fullName }) => ({
        value: id,
        label: fullName,
      })),
    [contractorsResult],
  );

  const { data: schemaForm, isLoading: isLoadingSchema } =
    useGetCreateInvoiceScheduleSchema({
      enabled: true,
      employmentId: selectedEmploymentId,
      jsfModify,
      includeOneTime: true,
      isContractorOfRecord,
      includeContractorSelect: rendersContractorSelect,
      contractors,
    });

  const createInvoiceScheduleMutation = useCreateInvoiceSchedule();
  const { mutateAsyncOrThrow } = mutationToPromise(
    createInvoiceScheduleMutation,
  );

  /**
   * Keeps the derived queries in step with the picker. Call from the consumer's change handler
   * when driving the form yourself; `InvoiceScheduleForm` wires this up for you.
   */
  const onContractorChange = useCallback((nextEmploymentId?: string) => {
    setSelectedEmploymentId(nextEmploymentId || undefined);
  }, []);

  // Annotated rather than inferred: the generated result's inferred type reaches into
  // json-schema-form internals that cannot be named from here (TS4023).
  const handleValidation = useCallback(
    async (
      values: InvoiceScheduleFormValues,
    ): Promise<ValidationResult | null> =>
      (schemaForm?.handleValidation(values) as ValidationResult | null) ?? null,
    [schemaForm],
  );

  // Coerces the raw form values into the shapes the API expects — most importantly money
  // inputs into integer cents, which `buildInvoiceItems` requires to pick a slot up.
  const parseValues = useCallback(
    async (values: InvoiceScheduleFormValues) =>
      (await parseJSFToValidate(values, schemaForm?.fields ?? [], {
        isPartialValidation: false,
      })) as InvoiceScheduleFormValues,
    [schemaForm],
  );

  const parseFormValues = useCallback(
    async (values: InvoiceScheduleFormValues) => {
      const parsed = await parseValues(values);
      const targetEmploymentId = employmentId ?? parsed.employment_id;

      return {
        employment_id: targetEmploymentId,
        ...buildInvoiceSchedulePayload(parsed),
      } as InvoiceSchedulePayload;
    },
    [employmentId, parseValues],
  );

  const onSubmit = useCallback(
    async (values: InvoiceScheduleFormValues) => {
      const parsed = await parseValues(values);
      const targetEmploymentId = employmentId ?? parsed.employment_id;

      if (!targetEmploymentId) {
        throw new Error(
          'No contractor selected. Pick a contractor or pass `employmentId` to the flow.',
        );
      }

      return mutateAsyncOrThrow({
        employmentId: targetEmploymentId,
        values: parsed,
      });
    },
    [employmentId, mutateAsyncOrThrow, parseValues],
  );

  return {
    /**
     * Form fields generated from the invoice-schedule schema, including the contractor picker
     * when the flow owns it.
     */
    fields: (schemaForm?.fields ?? []) as Fields,
    /**
     * Validation handler for the generated form.
     */
    handleValidation,
    /**
     * Turns form values into the API payload without submitting.
     */
    parseFormValues,
    /**
     * Creates the invoice schedule.
     */
    onSubmit,
    /**
     * Notify the flow that the chosen contractor changed.
     */
    onContractorChange,
    /**
     * The contractor the schedule will be created for, if known.
     */
    employmentId: selectedEmploymentId,
    /**
     * Whether this flow renders its own contractor picker.
     */
    rendersContractorSelect,
    /**
     * True while the schedule is being created.
     */
    isSubmitting: createInvoiceScheduleMutation.isPending,
    /**
     * True while contractors, the employment, or the schema are loading.
     */
    isLoading: isLoadingContractors || isLoadingEmployment || isLoadingSchema,
    /**
     * Whether the selected contractor is a Contractor of Record, which the platform restricts
     * to one-off invoicing.
     */
    isContractorOfRecord,
    /**
     * Contractor picker state. `isTruncated` is true when the company has more contractors than
     * the flow could load, so the picker is showing a subset.
     */
    contractors: {
      contractors: contractorsResult?.contractors ?? [],
      totalCount: contractorsResult?.totalCount ?? 0,
      isTruncated: contractorsResult?.isTruncated ?? false,
    },
    /**
     * Error raised while loading contractors, if any.
     */
    contractorsError,
    /**
     * Field metadata, for building error messages.
     */
    meta: {
      fields: schemaForm?.fields,
    },
  };
};
