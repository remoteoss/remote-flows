import { useCallback, useState } from 'react';
import {
  useCreateInvoiceSchedule,
  useGetCreateInvoiceScheduleSchema,
  usePreviewContractorInvoice,
} from '@/src/common/invoice-schedules/api';
import { ContractorInvoicePreview } from '@/src/common/invoice-schedules/types';
import { buildInvoiceSchedulePayload } from '@/src/common/invoice-schedules/utils';
import { useEmploymentQuery } from '@/src/common/api/employment';
import {
  InvoiceScheduleFormValues,
  InvoiceSchedulePayload,
  UseInvoiceScheduleOptions,
} from '@/src/flows/InvoiceSchedule/types';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { clearBase64Data } from '@/src/lib/utils';
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
 * submission, for the contractor named by `employmentId`. Sourcing that id — a picker, a route
 * param, a row the user clicked — is the consumer's; the flow only ever acts on one contractor.
 */
export const useInvoiceSchedule = ({
  employmentId,
  jsfModify,
}: UseInvoiceScheduleOptions) => {
  // The schema's conditionals depend on what has been filled in so far, so the current
  // values have to reach `createHeadlessForm`. `checkFieldUpdates` is wired to the form's
  // watch subscription by `useJSONSchemaForm`.
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});

  // `contractor_type` is not on the employments list payload, so the individual employment is
  // fetched purely to tell Contractor of Record apart.
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({
      employmentId,
      enabled: Boolean(employmentId),
    });

  const isContractorOfRecord =
    (employment as $TSFixMe)?.contractor_type === 'cor';

  const { data: schemaForm, isLoading: isLoadingCurrencies } =
    useGetCreateInvoiceScheduleSchema({
      enabled: true,
      employmentId,
      jsfModify,
      includeOneTime: true,
      isContractorOfRecord,
      includeCustomDays: true,
      fieldValues,
    });

  const createInvoiceScheduleMutation = useCreateInvoiceSchedule();
  const { mutateAsyncOrThrow } = mutationToPromise(
    createInvoiceScheduleMutation,
  );

  const previewContractorInvoiceMutation = usePreviewContractorInvoice();
  const { mutateAsyncOrThrow: previewContractorInvoiceAsync } =
    mutationToPromise(previewContractorInvoiceMutation);

  /**
   * Feed the latest form values back in so the schema's conditionals re-evaluate.
   * `InvoiceScheduleForm` wires this to the form's watch subscription.
   */
  const checkFieldUpdates = useCallback((values: InvoiceScheduleFormValues) => {
    setFieldValues(values);
  }, []);

  // Annotated rather than inferred: the generated result's inferred type reaches into
  // json-schema-form internals that cannot be named from here (TS4023).
  const handleValidation = useCallback(
    async (
      values: InvoiceScheduleFormValues,
    ): Promise<ValidationResult | null> => {
      if (!schemaForm) return null;

      // Values must be parsed first — money inputs hold strings, and the item amounts are
      // declared `integer`, which JSF v1 enforces. Validating raw values fails on every
      // amount and blocks submission.
      const parsed = await parseJSFToValidate(values, schemaForm.fields, {
        isPartialValidation: false,
      });

      return (schemaForm.handleValidation(parsed) as ValidationResult) ?? null;
    },
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

      if (!preview) return undefined;

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

      return mutateAsyncOrThrow({
        employmentId,
        values: parsed,
      });
    },
    [assertEmploymentId, employmentId, mutateAsyncOrThrow, parseValues],
  );

  return {
    /**
     * Form fields generated from the invoice-schedule schema.
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
     * The contractor the schedule will be created for.
     */
    employmentId,
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
