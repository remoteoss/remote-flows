import { CostCalculatorEstimateResponse } from '@/src/client';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useCostCalculatorContext } from '@/src/flows/CostCalculator/context';
import { EstimationError } from '@/src/flows/CostCalculator/hooks';
import { CostCalculatorEstimationFormValues } from '@/src/flows/CostCalculator/types';

function removeEmptyFields<T extends Record<string, unknown>>(
  values: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as Partial<T>;
}

type CostCalculatorFormProps = Partial<{
  /**
   * Callback function that handles form submission. When form is submit, the form values are sent to the consumer app before behind submitted to Remote.
   * @param data - The payload sent to the /cost-calculator/estimation endpoint.
   */
  onSubmit: (data: CostCalculatorEstimationFormValues) => Promise<void> | void;
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
}>;

export function CostCalculatorForm({
  onSubmit,
  onError,
  onSuccess,
  shouldResetForm,
}: CostCalculatorFormProps) {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();

  const handleSubmit = async (values: CostCalculatorEstimationFormValues) => {
    const cleanedValues = removeEmptyFields(values);
    const costCalculatorResults = await costCalculatorBag?.onSubmit(
      cleanedValues as CostCalculatorEstimationFormValues,
    );

    await onSubmit?.(cleanedValues as CostCalculatorEstimationFormValues);

    if (costCalculatorResults?.error) {
      onError?.(costCalculatorResults.error);
    } else {
      if (costCalculatorResults?.data) {
        await onSuccess?.(costCalculatorResults?.data);
        if (shouldResetForm) {
          costCalculatorBag?.resetForm();
          form.reset();
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
