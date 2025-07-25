import { CostCalculatorEstimateResponse } from '@/src/client';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useCostCalculatorContext } from '@/src/flows/CostCalculator/context';
import { EstimationError } from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationSubmitValues,
} from '@/src/flows/CostCalculator/types';

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
  onSuccess: (data: CostCalculatorEstimateResponse) => Promise<void> | void;
  /**
   * Callback function to handle the error when the estimation fails.
   * @param error - The error object.
   */
  onError: (error: EstimationError) => void;
  /**
   * Whether to reset the form when the form is successfully submitted.
   */
  shouldResetForm?: boolean;

  /**
   * Fields to reset when the form is successfully submitted.
   */
  shouldResetFormFields?: string[];
}>;

export function CostCalculatorForm({
  onSubmit,
  onError,
  onSuccess,
  shouldResetForm,
  shouldResetFormFields,
}: CostCalculatorFormProps) {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();

  const handleSubmit = async (values: CostCalculatorEstimationFormValues) => {
    const cleanedValues = costCalculatorBag?.parseFormValues(
      values,
    ) as CostCalculatorEstimationSubmitValues;
    const costCalculatorResults =
      await costCalculatorBag?.onSubmit(cleanedValues);

    await onSubmit?.(cleanedValues);

    if (costCalculatorResults?.error) {
      onError?.(costCalculatorResults.error);
    } else {
      if (costCalculatorResults?.data) {
        await onSuccess?.(costCalculatorResults?.data);
        // Reset the form completely
        if (shouldResetForm) {
          costCalculatorBag?.resetForm();
          form.reset();
          return;
        }

        // Reset only the form fields
        if (shouldResetFormFields) {
          const currentValues = form.getValues();
          const resetValues = { ...currentValues };
          shouldResetFormFields.forEach((field) => {
            resetValues[field] = '';
          });

          costCalculatorBag?.resetForm();
          form.reset(resetValues);
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__CostCalculatorForm"
      >
        <JSONSchemaFormFields fields={costCalculatorBag?.fields ?? []} />
      </form>
    </Form>
  );
}
