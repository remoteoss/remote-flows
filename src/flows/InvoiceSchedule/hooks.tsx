import { useCallback, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import {
  useCreateInvoiceSchedule,
  useGetCreateInvoiceScheduleSchema,
  usePreviewContractorInvoice,
} from '@/src/common/invoice-schedules/api';
import { ContractorInvoicePreview } from '@/src/common/invoice-schedules/types';
import { buildInvoiceSchedulePayload } from '@/src/common/invoice-schedules/utils';
import { useEmploymentQuery } from '@/src/common/api/employment';
import { getInitialValues } from '@/src/components/form/utils';
import {
  InvoiceScheduleFormValues,
  InvoiceSchedulePayload,
  UseInvoiceScheduleOptions,
} from '@/src/flows/InvoiceSchedule/types';
import { clearBase64Data, createStructuredError } from '@/src/lib/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { Fields } from '@remoteoss/remote-json-schema-form-kit';

/**
 * Headless hook powering the standalone invoice-schedule screen.
 *
 * Mirrors the platform's single-screen "Create invoice schedule" modal: one form render, one
 * submission, for the contractor named by `employmentId`. Sourcing that id — a picker, a route
 * param, a row the user clicked — is the consumer's; the flow only ever acts on one contractor.
 */
export const useInvoiceSchedule = ({
  employmentId,
  jsfModify,
  defaultValues,
}: UseInvoiceScheduleOptions) => {
  // `contractor_type` is not on the employments list payload, so the individual employment is
  // fetched purely to tell Contractor of Record apart.
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({
      employmentId,
      enabled: Boolean(employmentId),
    });

  const isContractorOfRecord =
    (employment as $TSFixMe)?.contractor_type === 'cor';

  const {
    data: schemaForm,
    handleValidation,
    onValuesChange: updateSchemaForValues,
    parseFormValues: parseValues,
    isLoading: isLoadingCurrencies,
  } = useGetCreateInvoiceScheduleSchema({
    enabled: true,
    employmentId,
    jsfModify,
    isContractorOfRecord,
    includeCustomDays: true,
  });

  const fields = useMemo(
    () => (schemaForm?.fields ?? []) as Fields,
    [schemaForm?.fields],
  );

  const initialValues = useMemo(
    () =>
      getInitialValues(fields, {
        currency: '',
        periodicity: '',
        start_date: '',
        number: '',
        note: '',
        ...defaultValues,
      }),
    [fields, defaultValues],
  );

  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  const checkFieldUpdates = useCallback(
    (values: FieldValues) => {
      setFieldValues(values);
      updateSchemaForValues(values);
    },
    [updateSchemaForValues],
  );

  const createInvoiceScheduleMutation = useCreateInvoiceSchedule();
  const { mutateAsyncOrThrow } = mutationToPromise(
    createInvoiceScheduleMutation,
  );

  const previewContractorInvoiceMutation = usePreviewContractorInvoice();
  const { mutateAsyncOrThrow: previewContractorInvoiceAsync } =
    mutationToPromise(previewContractorInvoiceMutation);

  const parseFormValues = useCallback(
    async (values: InvoiceScheduleFormValues) => {
      const parsed = await parseValues(values);

      return {
        employment_id: employmentId,
        ...buildInvoiceSchedulePayload(parsed),
      } as InvoiceSchedulePayload;
    },
    [employmentId, parseValues],
  );

  // `employmentId` is required by the types, but a consumer reading it off a route that has
  // not resolved yet still hands over an empty string. Both endpoints are scoped to an
  // employment, so fail here rather than calling them with a blank one.
  const assertEmploymentId = useCallback(() => {
    if (!employmentId) {
      throw new Error(
        'No contractor to act on. Pass a non-empty `employmentId` to the flow.',
      );
    }
  }, [employmentId]);

  /**
   * Renders the invoice the current form values describe as a draft PDF, without creating
   * anything. The preview endpoint covers a single invoice, so the recurrence fields are
   * left out of the payload — `buildInvoicePreviewPayload` does that.
   */
  const previewInvoice = useCallback(
    async (
      values: InvoiceScheduleFormValues,
    ): Promise<ContractorInvoicePreview | undefined> => {
      assertEmploymentId();
      const parsed = await parseValues(values);

      const response = await previewContractorInvoiceAsync({
        employmentId,
        values: parsed,
      });

      // Cast because `content` arrives as a `data:application/pdf;base64,…` string, not the
      // `Blob | File` the OpenAPI spec's `format: binary` makes the generated type promise.
      const preview = response?.data?.contractor_invoice_preview as
        | ContractorInvoicePreview
        | undefined;

      if (!preview) {
        return undefined;
      }

      return { ...preview, content: clearBase64Data(preview.content) };
    },
    [
      assertEmploymentId,
      employmentId,
      parseValues,
      previewContractorInvoiceAsync,
    ],
  );

  const onSubmit = useCallback(
    async (values: InvoiceScheduleFormValues) => {
      assertEmploymentId();
      const parsed = await parseValues(values);

      const response = await mutateAsyncOrThrow({
        employmentId,
        values: parsed,
      });

      if (response?.data?.failures?.length) {
        throw createStructuredError('Failed to create invoice schedule');
      }

      return response;
    },
    [assertEmploymentId, employmentId, mutateAsyncOrThrow, parseValues],
  );

  return {
    /**
     * Form fields generated from the invoice-schedule schema.
     */
    fields,
    /**
     * Starting values for the generated form, with `defaultValues` applied.
     */
    initialValues,
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
     * Renders the current form values as a draft invoice PDF without creating anything.
     * Resolves to a `data:application/pdf;base64,…` document, or `undefined` if the API
     * returned none. `InvoiceSchedulePreviewButton` wires this up for you.
     */
    previewInvoice,
    /**
     * Feed the latest form values back in so conditional fields re-evaluate.
     */
    checkFieldUpdates,
    /**
     * The latest form values, as last reported through `checkFieldUpdates`.
     */
    fieldValues,
    /**
     * The contractor the schedule will be created for.
     */
    employmentId,
    /**
     * The contractor's employment, once loaded.
     */
    employment,
    /**
     * True while the schedule is being created.
     */
    isSubmitting: createInvoiceScheduleMutation.isPending,
    /**
     * True while a draft PDF preview is being generated.
     */
    isPreviewingInvoice: previewContractorInvoiceMutation.isPending,
    /**
     * True until there is a form worth showing. Safe to return early on.
     *
     * Covers all three ways there isn't one yet:
     *
     * - `employmentId` is empty — the currencies query is disabled without one, so nothing
     *   is in flight and no schema is built. Reporting "ready" would hand the consumer a
     *   form with no fields and a live submit button.
     * - the currencies are still loading, so the schema cannot be built.
     * - the employment is still loading, so it is not yet known whether this contractor is
     *   a Contractor of Record. Rendering before that lets the user pick a frequency that
     *   the restriction then withdraws.
     *
     * The employment is only excluded from a loading flag when a picker can change the
     * contractor mid-flow, which would unmount a part-filled form. This flow is told its
     * contractor once, and both requests go out together, so waiting for both costs nothing.
     */
    isLoading:
      !employmentId ||
      isLoadingEmployment ||
      (isLoadingCurrencies && !schemaForm),
    /**
     * Whether the contractor is a Contractor of Record, which the platform restricts
     * to one-off invoicing.
     */
    isContractorOfRecord,
    /**
     * Field metadata, for building error messages.
     */
    meta: {
      fields: schemaForm?.fields,
    },
  };
};
