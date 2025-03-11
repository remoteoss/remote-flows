import { HeadlessFormOutput } from '@remoteoss/json-schema-form';
import React, { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { InferType } from 'yup';
import { number, object, string } from 'yup';
import type {
  CostCalculatorEstimateParams,
  CostCalculatorEstimateResponse,
  EmploymentTermType,
} from '../../client';
import { Form } from '../../components/ui/form';

import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import {
  useCalculatorLoadRegionFieldsSchemaForm,
  useCompanyCurrencies,
  useCostCalculatorCountries,
  useCostCalculatorEstimation,
} from '@/src/flows/CostCalculator/hooks';
import { JSONSchemaFormFields } from '../../components/form/JSONSchemaForm';
import { Button } from '../../components/ui/button';

const validationSchema = object({
  country: string().required('Country is required'),
  currency: string().required('Currency is required'),
  region: string(),
  salary: number()
    .typeError('Salary must be a number')
    .required('Salary is required'),
});

type FormValues = InferType<typeof validationSchema> & {
  [key: string]: any;
};

type Props = Partial<{
  /**
   * Estimation params allows you customize the params send to /cost-calculator/estimation endpoint
   * */
  estimationParams: {
    /**
     * Title of the estimation, default is 'My first estimation'
     */
    title?: string;
    /**
     * Include benefits in the estimation, default is false
     */
    includeBenefits?: boolean;
    /**
     * Include cost breakdowns in the estimation, default is false
     */
    includeCostBreakdowns?: boolean;
  };
  /**
   * Default values for the form fields
   */
  defaultValues: {
    /**
     * Default value for the country field
     */
    country?: string;
    /**
     * Default value for the currency field
     */
    currency?: string;
    /**
     * Default value for the region field
     */
    region?: string;
    /**
     * Default value for the salary field
     */
    salary?: number;
  };
  /**
   * Callback function to handle the form submit, when the submit button is clicked, we emit the payload sent back to you
   */
  onSubmit: (data: CostCalculatorEstimateParams) => void;
  /**
   * Callback function to handle the success when the estimation succeeds, we send you the CostCalculatorEstimateResponse
   */
  onSuccess: (data: CostCalculatorEstimateResponse) => void;
  /**
   * Callback function to handle the error when the estimation fails
   */
  onError: (error: Error) => void;
}>;

export function CostCalculator({
  estimationParams = {
    title: 'My first estimation',
    includeBenefits: false,
    includeCostBreakdowns: false,
  },
  defaultValues,
  onSubmit,
  onError,
  onSuccess,
}: Props) {
  console.log({ defaultValues });
  const handleJSONSchemaValidation =
    useRef<HeadlessFormOutput['handleValidation']>(null);
  const resolver = useValidationFormResolver(
    validationSchema,
    handleJSONSchemaValidation,
  );
  const form = useForm<FormValues>({
    resolver: resolver,
    defaultValues: {
      country: '',
      currency: '',
      region: '',
      salary: undefined,
    },
    mode: 'onBlur',
  });
  const selectCountryField = form.watch('country');

  const { data: currencies = [] } = useCompanyCurrencies();
  const { data: countries = [] } = useCostCalculatorCountries();
  const { data: jsonSchemaRegionFields } =
    useCalculatorLoadRegionFieldsSchemaForm(form.control);

  const costCalculatorEstimationMutation = useCostCalculatorEstimation();

  const selectedCountry = useMemo(() => {
    if (!selectCountryField) {
      return null;
    }

    const country = countries?.find((c) => c.value === selectCountryField);

    if (!country) {
      return null;
    }

    return country;
  }, [selectCountryField]);

  const regions =
    selectedCountry?.childRegions.map((region) => ({
      value: region.slug,
      label: region.name,
    })) ?? [];

  const handleSubmit = (values: FormValues) => {
    console.log({ contract_type: values.contract_duration_type });
    const regionSlug = values.region || selectedCountry?.regionSlug;

    const payload = {
      employer_currency_slug: values.currency as string,
      include_benefits: estimationParams.includeBenefits,
      include_cost_breakdowns: estimationParams.includeCostBreakdowns,
      employments: [
        {
          region_slug: regionSlug as string,
          annual_gross_salary: values.salary,
          annual_gross_salary_in_employer_currency: values.salary,
          employment_term:
            (values.contract_duration_type as EmploymentTermType) ?? 'fixed',
          title: estimationParams.title,
          regional_to_employer_exchange_rate: '1',
          age: (values.age as number) ?? undefined,
        },
      ],
    };

    onSubmit?.(payload);

    costCalculatorEstimationMutation.mutate(payload, {
      onSuccess: (data) => {
        if (data?.data) {
          onSuccess?.(data.data);
        }
      },
      onError: (error) => {
        onError?.(error);
      },
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <SelectField name="country" label="Country" options={countries} />

          {regions.length > 0 && (
            <SelectField name="region" label="Region" options={regions} />
          )}

          <SelectField name="currency" label="Currency" options={currencies} />

          <TextField name="salary" label="Salary" type="number" />

          {jsonSchemaRegionFields && (
            <JSONSchemaFormFields fields={jsonSchemaRegionFields.fields} />
          )}

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
