import { HeadlessFormOutput } from '@remoteoss/json-schema-form';
import React, { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { InferType } from 'yup';
import { object, string } from 'yup';

import type {
  CostCalculatorEstimateParams,
  CostCalculatorEstimateResponse,
  EmploymentTermType,
} from '@/src/client';
import { Form } from '@/src/components/ui/form';

import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Button } from '@/src/components/ui/button';
import {
  useCalculatorLoadRegionFieldsSchemaForm,
  useCompanyCurrencies,
  useCostCalculatorCountries,
  useCostCalculatorEstimation,
} from '@/src/flows/CostCalculator/hooks';

const validationSchema = object({
  country: string().required('Country is required'),
  currency: string().required('Currency is required'),
  region: string(),
  salary: string()
    .typeError('Salary must be a number')
    .required('Salary is required'),
});

type FormValues = InferType<typeof validationSchema> & {
  contract_duration_type?: EmploymentTermType;
  age?: number;
};

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
  const handleJSONSchemaValidation =
    useRef<HeadlessFormOutput['handleValidation']>(null);
  const resolver = useValidationFormResolver(
    validationSchema,
    handleJSONSchemaValidation,
  );
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
  const selectCountryField = form.watch('country');

  const { data: currencies = [] } = useCompanyCurrencies();
  const { data: countries = [] } = useCostCalculatorCountries();
  const { data: jsonSchemaRegionFields } =
    useCalculatorLoadRegionFieldsSchemaForm(form.control);

  handleJSONSchemaValidation.current =
    jsonSchemaRegionFields?.handleValidation ?? null;

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
  }, [selectCountryField, countries]);

  const regions =
    selectedCountry?.childRegions.map((region) => ({
      value: region.slug,
      label: region.name,
    })) ?? [];

  const handleSubmit = (values: FormValues) => {
    const regionSlug = values.region || selectedCountry?.regionSlug;
    const currencySlug = currencies.find(
      (currency) => currency.value === values.currency,
    )?.slug;

    const payload = {
      employer_currency_slug: currencySlug as string,
      include_benefits: estimationParams.includeBenefits,
      include_cost_breakdowns: estimationParams.includeCostBreakdowns,
      employments: [
        {
          region_slug: regionSlug as string,
          annual_gross_salary: parseFloat(values.salary),
          annual_gross_salary_in_employer_currency: parseFloat(values.salary),
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
