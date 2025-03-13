import React from 'react';
import { useForm } from 'react-hook-form';

import type {
  CostCalculatorEstimateParams,
  CostCalculatorEstimateResponse,
  EmploymentTermType,
} from '@/src/client';
import { Form } from '@/src/components/ui/form';

import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Button } from '@/src/components/ui/button';
import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';

type FormValues = {
  currency: string;
  country: string;
  salary: string;
} & Partial<{
  region: string;
  age: number;
  contract_duration_type: EmploymentTermType;
}>;

type CostCalculatorProps = Partial<{
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationParams: Partial<{
    /**
     * Title of the estimation. Default is 'Estimation'.
     */
    title: string;
    /**
     * Include benefits in the estimation. Default is false.
     */
    includeBenefits: boolean;
    /**
     * Include cost breakdowns in the estimation. Default is false.
     */
    includeCostBreakdowns: boolean;
  }>;
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
  const form = useForm<FormValues>({
    resolver: resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      employer_currency_slug: values.currency,
      include_benefits: estimationParams.includeBenefits,
      include_cost_breakdowns: estimationParams.includeCostBreakdowns,
      employments: [
        {
          region_slug: values.region || values.country,
          annual_gross_salary: parseFloat(values.salary),
          annual_gross_salary_in_employer_currency: parseFloat(values.salary),
          employment_term: values.contract_duration_type ?? 'fixed',
          title: estimationParams.title,
          regional_to_employer_exchange_rate: '1',
          age: values.age ?? undefined,
        },
      ],
    };

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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <JSONSchemaFormFields fields={fields} />
          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            Save
          </Button>
        </form>
      </Form>
    </>
  );
}
