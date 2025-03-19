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
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorEstimateFormValues,
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
  params: Partial<{
    disclaimer: {
      label: string;
    };
  }>;
  /**
   * Callback function that handles form submission. When form is submit, the form values are sent to the consumer app before behind submitted to Remote.
   * @param data - The payload sent to the /cost-calculator/estimation endpoint.
   */
  onSubmit: (data: CostCalculatorEstimateFormValues) => Promise<void> | void;
  /**
   * Callback function to handle the success when the estimation succeeds. The CostCalculatorEstimateResponse is sent back to you.
   * @param data - The response data from the /cost-calculator/estimation endpoint.
   */
  onSuccess: (data: CostCalculatorEstimateResponse) => Promise<void> | void;
  /**
   * Callback function to handle the error when the estimation fails.
   * @param error - The error object.
   */
  onError: (error: Error) => void;
}>;

export function CostCalculator({
  estimationOptions = defaultEstimationOptions,
  defaultValues = {
    countryRegionSlug: '',
    currencySlug: '',
    salary: '',
  },
  params,
  onSubmit,
  onError,
  onSuccess,
}: CostCalculatorProps) {
  const {
    onSubmit: submitCostCalculator,
    fields,
    validationSchema,
  } = useCostCalculator(estimationOptions);

  const resolver = useValidationFormResolver(validationSchema);
  const form = useForm<CostCalculatorEstimateFormValues>({
    resolver: resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: CostCalculatorEstimateFormValues) => {
    await onSubmit?.(values);

    const estimation = await submitCostCalculator(values);

    if (estimation.error) {
      onError?.(estimation.error);
    } else {
      onSuccess?.(estimation.data);
    }
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
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            Save
          </Button>
        </form>
      </Form>
      <div className="RemoteFlows__CostCalculator__Disclaimer">
        <Disclaimer label={params?.disclaimer?.label} />
      </div>
    </>
  );
}
