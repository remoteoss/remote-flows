import { CostCalculatorEstimateResponse } from '@/src/client';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useCostCalculatorContext } from '@/src/flows/CostCalculator/context';
import { EstimationError } from '@/src/flows/CostCalculator/hooks';
import { CostCalculatorEstimationFormValues } from '@/src/flows/CostCalculator/types';
import React from 'react';

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
}>;

export function CostCalculatorForm({
  onSubmit,
  onError,
  onSuccess,
}: CostCalculatorFormProps) {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();

  const handleSubmit = async (values: CostCalculatorEstimationFormValues) => {
    const costCalculatorResults = await costCalculatorBag?.onSubmit(values);

    await onSubmit?.(values);

    if (costCalculatorResults?.error) {
      onError?.(costCalculatorResults.error);
    } else {
      if (costCalculatorResults?.data) {
        await onSuccess?.(costCalculatorResults?.data);
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
