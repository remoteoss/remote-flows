import { useEffect } from 'react';
import { CostCalculatorEstimateResponse } from '@/src/client';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import { useCostCalculatorContext } from '@/src/flows/CostCalculator/context';
import {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationSubmitValues,
  EstimationError,
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
  resetFields?: ('country' | 'currency' | 'salary')[];
}>;

export function CostCalculatorForm({
  onSubmit,
  onError,
  onSuccess,
  shouldResetForm,
  resetFields,
}: CostCalculatorFormProps) {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();

  const {
    formState: { isSubmitSuccessful },
  } = form;

  useEffect(() => {
    // resets the entire form if the form is successfully submitted and the shouldResetForm prop is true
    if (isSubmitSuccessful && shouldResetForm) {
      costCalculatorBag?.resetForm();
      form.reset();
      return;
    }

    // resets the specified fields if the form is successfully submitted and the resetFields prop is provided
    if (isSubmitSuccessful && resetFields) {
      // Reset only the specified fields
      const currentValues = form.getValues();
      const resetValues = { ...currentValues };
      resetFields.forEach((field) => {
        resetValues[field] = '';
      });

      costCalculatorBag?.resetForm();
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
      const parsedValues = costCalculatorBag?.parseFormValues(
        values,
      ) as CostCalculatorEstimationSubmitValues;

      const costCalculatorResults =
        await costCalculatorBag?.onSubmit(parsedValues);

      // if this rejects, catch will handle it
      await onSubmit?.(parsedValues);

      if (costCalculatorResults?.error) {
        onError?.(costCalculatorResults.error);
      } else if (costCalculatorResults?.data) {
        await onSuccess?.(costCalculatorResults.data);
      }
    } catch (err) {
      onError?.(err as EstimationError);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__CostCalculatorForm'
      >
        <JSONSchemaFormFields fields={costCalculatorBag?.fields ?? []} />
      </form>
    </Form>
  );
}
