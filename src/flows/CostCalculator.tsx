import React, { useEffect, useMemo, useRef, useState } from 'react';
import { number, object, string } from 'yup';
import type { InferType } from 'yup';
import type {
  CostCalculatorEstimateResponse,
  EmploymentTermType,
} from '../client';
import { useForm } from 'react-hook-form';
import { HeadlessFormOutput } from '@remoteoss/json-schema-form';
import { Form } from '../components/ui/form';

import { Button } from '../components/ui/button';
import { JSONSchemaFormFields } from '../components/form/JSONSchemaForm';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import {
  useCalculatorCountries,
  useCalculatorEstimation,
  useCalculatorLoadRegionFieldsSchemaForm,
  useCompanyCurrencies,
} from '@/src/flows/hooks';

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

type Props = {
  onSubmit: (data: CostCalculatorEstimateResponse) => void;
};

export function CostCalculator({ onSubmit }: Props) {
  const handleJSONSchemaValidation =
    useRef<HeadlessFormOutput['handleValidation']>(null);
  const resolver = useValidationFormResolver(
    validationSchema,
    handleJSONSchemaValidation,
  );
  const [regionSlug, setRegionSlug] = useState<string | null>(null);
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
  const selectedCountryForm = form.watch('country');
  const selectedRegion = form.watch('region');

  const { data: currencies = [] } = useCompanyCurrencies();
  const { data: countries = [] } = useCalculatorCountries();
  const { data: jsonSchemaRegionFields } =
    useCalculatorLoadRegionFieldsSchemaForm(regionSlug);
  const mutation = useCalculatorEstimation();

  const selectedCountry = useMemo(() => {
    if (!selectedCountryForm) {
      return null;
    }

    const country = countries?.find((c) => c.value === selectedCountryForm);

    if (!country) {
      return null;
    }

    return country;
  }, [selectedCountryForm]);

  const regions =
    selectedCountry?.childRegions.map((region) => ({
      value: region.slug,
      label: region.name,
    })) ?? [];

  useEffect(() => {
    if (selectedCountry) {
      if (
        selectedCountry?.childRegions.length === 0 &&
        selectedCountry.hasAdditionalFields
      ) {
        // test this with italy
        setRegionSlug(selectedCountry.regionSlug);
      }
    }
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (selectedRegion) {
      setRegionSlug(selectedRegion);
    }
  }, [selectedRegion]);

  const handleSubmit = (values: FormValues) => {
    const regionSlug = values.region
      ? values.region
      : selectedCountry?.regionSlug;

    const payload = {
      employer_currency_slug: values.currency as string,
      include_benefits: true,
      include_cost_breakdowns: true,
      employments: [
        {
          region_slug: regionSlug as string,
          annual_gross_salary: values.salary,
          annual_gross_salary_in_employer_currency: values.salary,
          employment_term:
            (values.contract_duration_type as EmploymentTermType) ?? 'fixed',
          title: 'My first estimation',
          regional_to_employer_exchange_rate: '1',
          age: (values.age as number) ?? undefined,
        },
      ],
    };

    mutation.mutate(payload, {
      onSuccess: (data) => {
        if (data?.data) {
          onSubmit(data.data);
        }
      },
      onError: (error) => {
        console.error(error);
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
