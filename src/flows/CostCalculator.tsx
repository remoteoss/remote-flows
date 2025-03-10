import React, { useEffect, useRef, useState } from 'react';
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
  GetIndexCountryResponse,
  MinimalRegion,
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
  const [jsonForm, setJsonForm] = useState<any>();
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
  const selectedCountry = form.watch('country');
  const selectedRegion = form.watch('region');

  const [regions, setRegions] = useState<MinimalRegion[]>([]);

  const [currencies, setCurrencies] = React.useState<any>([]);
  const { data: countries = [] } = useCalculatorCountries();

  const optionsRegions = regions.map((region) => ({
    value: region.slug,
    label: region.name,
  }));

  const currenciesOptions = currencies.map(
    (currency: { code: string; slug: string }) => ({
      value: currency.slug,
      label: currency.code,
    }),
  );

  async function loadJsonForm(regionSlug: string) {
    try {
      setJsonForm(null);

      const res = await getShowRegionField({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { slug: regionSlug },
      });

      const jsonSchemaForm = createHeadlessForm(res?.data?.data?.schema || {}, {
        strictInputType: false,
      });

      handleJSONSchemaValidation.current = jsonSchemaForm.handleValidation;

      setJsonForm(jsonSchemaForm);
    } catch (e) {
      console.error(e);
      setJsonForm(null);
    }
  }

  useEffect(() => {
    if (selectedCountry) {
      const country = countries?.find((c) => c.value === selectedCountry);
      if (country?.childRegions.length !== 0) {
        setRegions(country ? country.childRegions : []);
      }

      if (country?.childRegions.length === 0 && country.hasAdditionalFields) {
        // test this with italy
        loadJsonForm(country.regionSlug);
      }
    }
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (selectedRegion) {
      loadJsonForm(selectedRegion);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (client) {
      getIndexCompanyCurrency({
        client: client,
        headers: {
          Authorization: ``,
        },
      })
        .then((res) => {
          if (res.data?.data) {
            setCurrencies(res.data?.data.company_currencies);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  const findSlugInCountry = (countryCode: string) => {
    const country = countries?.find((c) => c.value === countryCode);
    return country?.regionSlug;
  };

  const handleSubmit = (values: FormValues) => {
    const regionSlug = values.region
      ? values.region
      : findSlugInCountry(values.country);

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

          {optionsRegions.length > 0 && (
            <SelectField
              name="region"
              label="Region"
              options={optionsRegions}
            />
          )}

          <SelectField
            name="currency"
            label="Currency"
            options={currenciesOptions}
          />

          <TextField name="salary" label="Salary" type="number" />

          {jsonForm && <JSONSchemaFormFields fields={jsonForm.fields} />}

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
