import { useEffect } from 'react';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useCostCalculatorContext } from '@/src/flows/CostCalculator/context';
import {
  CostCalculatorEstimationResponse,
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationSubmitValues,
  EstimationError,
} from '@/src/flows/CostCalculator/types';
import {
  FieldError,
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';
import { prettifyFormValues } from '@/src/lib/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

type CostCalculatorFormProps = Partial<{
  /**
   * Callback function that handles form submission. When form is submit, the form values are sent to the consumer app before behind submitted to Remote.
   * @param data - The payload sent to the /cost-calculator/estimation endpoint.
   */
  onSubmit: (
    data: CostCalculatorEstimationSubmitValues,
  ) => Promise<void> | void;
  /**
   * Callback function to handle the success when the estimation succeeds. The CostCalculatorEstimateResponse is sent back to you.
   * @param data - The response data from the /cost-calculator/estimation endpoint.
   */
  onSuccess: (data: CostCalculatorEstimationResponse) => Promise<void> | void;
  /**
   * Callback function to handle the error when the estimation fails.
   * @param error - The error object.
   */
  onError: (error: EstimationError) => void;
  /**
   * Enhanced callback function to handle errors with field-level details.
   * @param error - The error object with field errors.
   */
  onErrorWithFields?: ({
    error,
    fieldErrors,
  }: {
    error: Error;
    fieldErrors: NormalizedFieldError[];
    rawError: Record<string, unknown>;
  }) => void;
  /**
   * Whether to reset the form when the form is successfully submitted.
   */
  shouldResetForm?: boolean;

  /**
   * Fields to reset when the form is successfully submitted.
   */
  resetFields?: ('country' | 'currency' | 'salary')[];
}>;

export function CostCalculatorForm({
  onSubmit,
  onError,
  onSuccess,
  onErrorWithFields,
  shouldResetForm,
  resetFields,
}: CostCalculatorFormProps) {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();

  const {
    formState: { isSubmitSuccessful },
  } = form;

  useEffect(() => {
    // resets the entire form if the form is successfully submitted and the shouldResetForm prop is true.
    // `resetForm()` bumps the flow's `resetKey`, remounting the RHF form with freshly computed
    // default values — no explicit `form.reset()` needed (and calling it here would race the
    // remount against a form instance that's about to be torn down).
    if (isSubmitSuccessful && shouldResetForm) {
      costCalculatorBag?.resetForm();
      return;
    }

    // resets the specified fields if the form is successfully submitted and the resetFields prop is provided.
    // This must NOT remount the form — it has to preserve every value the user entered other
    // than the fields being blanked — so it opts out of the resetKey bump and blanks each field
    // to the same default it would get from a full reset.
    if (isSubmitSuccessful && resetFields) {
      // `resetFields` clears the listed fields to blank so the user can pick again — e.g.
      // `resetFields={['country']}` after a successful estimate — regardless of whatever
      // `defaultValues` the consumer originally configured the flow with, so this
      // intentionally does not source the blanked value from `defaultValues`.
      const currentValues = form.getValues();
      const resetValues = { ...currentValues };
      resetFields.forEach((field) => {
        resetValues[field] = '';
      });

      costCalculatorBag?.resetForm({ remount: false });
      form.reset(resetValues);
    }
  }, [
    isSubmitSuccessful,
    form,
    shouldResetForm,
    costCalculatorBag,
    resetFields,
  ]);

  const handleSubmit = async (values: CostCalculatorEstimationFormValues) => {
    try {
      const parsedValues = (await costCalculatorBag?.parseFormValues(
        values,
      )) as CostCalculatorEstimationSubmitValues;

      if (costCalculatorBag?.meta?.fields) {
        costCalculatorBag.meta.fields = prettifyFormValues(
          parsedValues,
          costCalculatorBag.fields,
        );
        costCalculatorBag.meta.fields['employer_currency_slug'] =
          costCalculatorBag.meta.fields['currency'];
      }

      const costCalculatorResults =
        await costCalculatorBag?.onSubmit(parsedValues);

      // if this rejects, catch will handle it
      await onSubmit?.(parsedValues);

      if (costCalculatorResults?.data && !costCalculatorResults.error) {
        const responseWithTitle = {
          data: {
            ...costCalculatorResults.data.data,
            employments: (
              costCalculatorResults as $TSFixMe
            ).data.data.employments?.map((employment: $TSFixMe) => ({
              ...employment,
              title: parsedValues.estimation_title,
            })),
          },
        };
        await onSuccess?.(responseWithTitle);
      } else {
        throw {
          data: null,
          error: costCalculatorResults?.error,
          fieldErrors: costCalculatorResults?.fieldErrors,
          rawError: costCalculatorResults?.rawError,
        };
      }
    } catch (err) {
      // Handles here the errors caused by the API
      const error = err as {
        data: null;
        error: EstimationError;
        fieldErrors: FieldError[];
        rawError: Record<string, unknown>;
      };

      const fieldErrors = error.fieldErrors;

      if (onErrorWithFields) {
        // Create field metadata for better error messages
        const fieldsMeta = costCalculatorBag?.meta?.fields;

        // Normalize field errors with user-friendly labels
        const normalizedFieldErrors = normalizeFieldErrors(
          fieldErrors,
          fieldsMeta,
        );

        onErrorWithFields({
          error: error.error as Error,
          rawError: error.rawError as Record<string, unknown>,
          fieldErrors: normalizedFieldErrors,
        });
      } else {
        // Fall back to the original error handler
        onError?.(error.error);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__CostCalculatorForm'
      >
        <JSONSchemaFormFields
          fields={costCalculatorBag?.fields ?? []}
          fieldValues={costCalculatorBag?.fieldValues}
          fieldsets={costCalculatorBag?.meta?.['x-jsf-fieldsets']}
        />
      </form>
    </Form>
  );
}
