import React, { useEffect, useMemo, useRef, useState } from 'react';
import { object, string } from 'yup';
import type { InferType } from 'yup';
import { useClient } from '../RemoteFlowsProvider';
import {
  getIndexCompanyCurrency,
  getIndexCountry,
  getShowRegionField,
  postCreateEstimation,
} from '../client/sdk.gen';
import type {
  CostCalculatorEstimateResponse,
  EmploymentTermType,
} from '../client';
import { useForm } from 'react-hook-form';
import {
  createHeadlessForm,
  HeadlessFormOutput,
} from '@remoteoss/json-schema-form';
import { Form } from '../components/ui/form';

import { Button } from '../components/ui/button';
import { Client } from '@hey-api/client-fetch';
import { JSONSchemaFormFields } from '../components/form/JSONSchemaForm';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';
import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { useQuery } from '@tanstack/react-query';

const useCalculatorCountries = () => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['cost-calculator-countries'],
    queryFn: () => {
      return getIndexCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
      });
    },
    enabled: !!client,
    select: (data) =>
      data.data?.data.map((country) => ({
        value: country.code,
        label: country.name,
        childRegions: country.child_regions,
        hasAdditionalFields: country.has_additional_fields,
        regionSlug: country.region_slug,
      })),
  });
};

const useCalculatorLoadRegionFieldsSchemaForm = (regionSlug: string | null) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['cost-calculator-region-fields', regionSlug],
    queryFn: () => {
      return getShowRegionField({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { slug: regionSlug as string },
      });
    },
    enabled: !!client && !!regionSlug,
    select: (data) =>
      createHeadlessForm(data?.data?.data?.schema || {}, {
        strictInputType: false,
      }),
  });
};

const useCompanyCurrencies = () => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['company-currencies'],
    queryFn: () => {
      return getIndexCompanyCurrency({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
      });
    },
    enabled: !!client,
    select: (data) =>
      data.data?.data?.company_currencies.map((currency) => ({
        value: currency.slug,
        label: currency.code,
      })),
  });
};

const validationSchema = object({
  country: string().required('Country is required'),
  currency: string().required('Currency is required'),
  region: string(),
  salary: string().required('Salary is required'),
});

type FormValues = InferType<typeof validationSchema> & {
  [key: string]: any;
};

type Props = {
  onSubmit: (data: CostCalculatorEstimateResponse | undefined) => void;
};

export function CostCalculator({ onSubmit }: Props) {
  const { client } = useClient();
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
  const { data: jsonSchemaForm } =
    useCalculatorLoadRegionFieldsSchemaForm(regionSlug);

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

  const regions = useMemo(() => {
    if (selectedCountry) {
      return (
        selectedCountry?.childRegions.map((region) => ({
          value: region.slug,
          label: region.name,
        })) ?? []
      );
    }
    return [];
  }, [selectedCountry, countries]);

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
          annual_gross_salary: parseFloat(values.salary),
          annual_gross_salary_in_employer_currency: parseFloat(values.salary),
          employment_term:
            (values.contract_duration_type as EmploymentTermType) ?? 'fixed',
          title: 'My first estimation',
          regional_to_employer_exchange_rate: '1',
          age: (values.age as number) ?? undefined,
        },
      ],
    };

    postCreateEstimation({
      client: client as Client,
      headers: {
        Authorization: ``,
      },
      body: payload,
    })
      .then((res) => {
        onSubmit(res.data);
      })
      .catch((err) => {
        console.error(err);
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

          {jsonSchemaForm && (
            <JSONSchemaFormFields fields={jsonSchemaForm.fields} />
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
