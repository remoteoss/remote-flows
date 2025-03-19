import React from 'react';
import { useForm } from 'react-hook-form';

import type {
  CostCalculatorEstimateParams,
  CostCalculatorEstimateResponse,
} from '@/src/client';
import { Form } from '@/src/components/ui/form';

import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Button } from '@/src/components/ui/button';
import { Disclaimer } from '@/src/flows/CostCalculator/Disclaimer';
import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorFormValues,
  EstimationParams,
} from '@/src/flows/CostCalculator/types';
import { buildCostCalculatorFormPayload } from '@/src/flows/CostCalculator/factory';

type CostCalculatorProps = Partial<{
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationParams: EstimationParams;
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
   * Callback function to handle the form submission. When the submit button is clicked, the payload is sent back to you.
   * @param data - The payload sent to the /cost-calculator/estimation endpoint.
   */
  onSubmit: (data: CostCalculatorEstimateParams) => Promise<void> | void;
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
  estimationParams = {
    title: 'Estimation',
    includeBenefits: false,
    includeCostBreakdowns: false,
  },
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
  } = useCostCalculator();

  const resolver = useValidationFormResolver(validationSchema);
  const form = useForm<CostCalculatorFormValues>({
    resolver: resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: CostCalculatorFormValues) => {
    const payload = buildCostCalculatorFormPayload(values, estimationParams);

    await onSubmit?.(payload);

    try {
      const estimation = await submitCostCalculator(payload);
      if (estimation) {
        onSuccess?.(estimation);
      }
    } catch (error) {
      onError?.(error as Error);
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
