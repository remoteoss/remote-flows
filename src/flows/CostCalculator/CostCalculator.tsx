import React from 'react';
import { useForm } from 'react-hook-form';

import type { CostCalculatorEstimateResponse } from '@/src/client';
import { Form } from '@/src/components/ui/form';

import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Button } from '@/src/components/ui/button';
import { Disclaimer } from '@/src/flows/CostCalculator/Disclaimer';
import {
  defaultEstimationOptions,
  EstimationError,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';

import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
} from './types';

type CostCalculatorProps = Partial<{
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationOptions?: CostCalculatorEstimationOptions;
  /**
   * Default values for the form fields.
   */
  defaultValues: Partial<{
    /**
     * Default value for the country field.
     */
    countryRegionSlug: string;
    /**
     * Default value for the currency field.
     */
    currencySlug: string;
    /**
     * Default value for the salary field.
     */
    salary: string;
  }>;
  /**
   * Options for the CostCalculator component.
   */
  options: Partial<{
    /**
     * Disclaimer options.
     */
    disclaimer: {
      /**
       * Label for the disclaimer
       * @default 'Disclaimer'
       * */
      label: string;
    };
  }>;
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

export function CostCalculator({
  estimationOptions = defaultEstimationOptions,
  defaultValues = {
    countryRegionSlug: '',
    currencySlug: '',
    salary: '',
  },
  options,
  onSubmit,
  onError,
  onSuccess,
}: CostCalculatorProps) {
  const [resetForm, setResetForm] = React.useState(false);
  const {
    onSubmit: submitCostCalculator,
    fields,
    validationSchema,
    isSubmitting,
  } = useCostCalculator({
    defaultRegion: defaultValues.countryRegionSlug,
    estimationOptions,
    resetForm: resetForm,
  });

  const resolver = useValidationFormResolver(validationSchema);
  const form = useForm<CostCalculatorEstimationFormValues>({
    resolver: resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
    },
    shouldUnregister: true,
    mode: 'onBlur',
  });

  const handleSubmit = async (values: CostCalculatorEstimationFormValues) => {
    await onSubmit?.(values);

    const estimation = await submitCostCalculator(values);

    if (estimation.error) {
      onError?.(estimation.error);
    } else {
      onSuccess?.(estimation.data);
    }
  };

  const handleReset = () => {
    setResetForm(true);
    form.reset();
    setTimeout(() => {
      setResetForm(false);
    }, 100);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 RemoteFlows__CostCalculatorForm"
        >
          <JSONSchemaFormFields fields={fields} />
          <Button
            type="submit"
            className="RemoteFlows__CostCalculatorForm__SubmitButton"
            disabled={isSubmitting}
          >
            Get estimate
          </Button>
          <Button
            className="RemoteFlows__CostCalculatorForm__ResetButton"
            type="reset"
            onClick={handleReset}
          >
            Reset
          </Button>
        </form>
      </Form>
      <div className="RemoteFlows__CostCalculator__Disclaimer">
        <Disclaimer label={options?.disclaimer?.label} />
      </div>
    </>
  );
}
