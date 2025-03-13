import React from 'react';
import { useForm } from 'react-hook-form';
import { object, type AnyObjectSchema } from 'yup';

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
import type { Field } from '@/src/flows/CostCalculator/types';

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
    country: string;
    /**
     * Default value for the currency field.
     */
    currency: string;
    /**
     * Default value for the salary field.
     */
    salary: string;
  }>;
  /**
   * Callback function to handle the form submission. When the submit button is clicked, the payload is sent back to you.
   * @param data - The payload sent to the /cost-calculator/estimation endpoint.
   */
  onSubmit: (data: CostCalculatorEstimateParams) => void;
  /**
   * Callback function to handle the success when the estimation succeeds. The CostCalculatorEstimateResponse is sent back to you.
   * @param data - The response data from the /cost-calculator/estimation endpoint.
   */
  onSuccess: (data: CostCalculatorEstimateResponse) => void;
  /**
   * Callback function to handle the error when the estimation fails.
   * @param error - The error object.
   */
  onError: (error: Error) => void;
}>;

/**
 * Build the validation schema for the form.
 * @returns
 */
function buildValidationSchema(fields: Field[]) {
  const fieldsSchema = fields.reduce<Record<string, AnyObjectSchema>>(
    (fieldsSchemaAcc, field) => {
      fieldsSchemaAcc[field.name] = field.schema as AnyObjectSchema;
      return fieldsSchemaAcc;
    },
    {},
  );
  return object(fieldsSchema) as AnyObjectSchema;
}

export function CostCalculator({
  estimationParams = {
    title: 'Estimation',
    includeBenefits: false,
    includeCostBreakdowns: false,
  },
  defaultValues = {
    country: '',
    currency: '',
    salary: '',
  },
  onSubmit,
  onError,
  onSuccess,
}: CostCalculatorProps) {
  const { onSubmit: submitCostCalculator, fields } = useCostCalculator();

  const validationSchema = buildValidationSchema(fields);
  const resolver = useValidationFormResolver(validationSchema);
  const form = useForm<FormValues>({
    resolver: resolver,
    defaultValues: {
      country: defaultValues?.country,
      currency: defaultValues?.currency,
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
      const { data } = await submitCostCalculator(payload);
      if (data) {
        onSuccess?.(data);
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
