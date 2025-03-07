import React, { useEffect, useState } from 'react';
import { useClient } from '../RemoteFlowsProvider';
import {
  getIndexCountry,
  getShowCompany,
  getShowRegionField,
  postCreateEstimation,
} from '../client/sdk.gen';
import type { GetIndexCountryResponse, MinimalRegion } from '../client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { Form } from '../components/form';

import { Button } from '../components/button';
import { Client } from '@hey-api/client-fetch';
import { JSONSchemaFormFields } from '../components/json-schema-form';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';

const formSchema = z
  .object({
    country: z.string().min(1, 'Country is required'),
    currency: z.string().optional(),
    region: z.string().optional(),
    salary: z.number().min(1, 'Amount must be greater than 0'),
  })
  .passthrough();

type FormValues = z.infer<typeof formSchema>;

type Props = {
  companyId: string;
};

export function CostCalculator({ companyId }: Props) {
  const { client } = useClient();
  const [savedValues, setSavedValues] = useState<FormValues | null>(null);
  const [jsonForm, setJsonForm] = useState<any>();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
  const [countries, setCountries] = React.useState<
    GetIndexCountryResponse['data']
  >([]);

  const [regions, setRegions] = useState<MinimalRegion[]>([]);

  const [currencies, setCurrencies] = React.useState<any>([]);

  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  const optionsCountries = countries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

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
      setIsLoadingSchema(true);

      const res = await getShowRegionField({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { slug: regionSlug },
      });

      setJsonForm(
        createHeadlessForm(res?.data?.data?.schema || {}, {
          strictInputType: false,
        }),
      );
    } catch (e) {
      console.error(e);
      setJsonForm(null);
    } finally {
      setIsLoadingSchema(false);
    }
  }

  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find((c) => c.code === selectedCountry);
      if (country?.child_regions.length !== 0) {
        setRegions(country ? country.child_regions : []);
      }

      if (
        country?.child_regions.length === 0 &&
        country.has_additional_fields
      ) {
        // test this with italy
        loadJsonForm(country.region_slug);
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
      getIndexCountry({
        client: client,
        headers: {
          Authorization: ``,
        },
      })
        .then((res) => {
          if (res.data?.data) {
            setCountries(res.data?.data);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [client]);

  useEffect(() => {
    if (client && companyId) {
      getShowCompany({
        client: client,
        headers: {
          Authorization: ``,
        },
        path: {
          company_id: companyId,
        },
      })
        .then((res) => {
          if (res.data?.data.company.supported_currencies) {
            setCurrencies(res.data?.data.company.supported_currencies);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [companyId]);

  const findSlugInCountry = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country?.region_slug;
  };

  const handleSubmit = (values: FormValues) => {
    const { handleValidation } = jsonForm;
    const formErrors = handleValidation(values);
    if (
      formErrors?.formErrors &&
      Object.keys(formErrors.formErrors).length > 0
    ) {
      Object.entries(formErrors.formErrors).forEach(([field, message]) => {
        form.setError(field as any, {
          type: 'manual',
          message: message as string,
        });
      });
      return;
    }

    const regionSlug = values.region
      ? values.region
      : findSlugInCountry(values.country);

    console.log({ currencies });

    /* const payload = {
      employer_currency_slug: values.currency as string,
      include_benefits: false,
      include_cost_breakdowns: false,
      employments: [
        {
          region_slug: regionSlug as string,
          annual_gross_salary: values.salary as number,
          annual_gross_salary_in_employer_currency: values.salary as number,
          employment_term:
            (values.contract_duration_type as EmploymentTermType) ?? 'fixed',
          title: 'My first estimation',
          regional_to_employer_exchange_rate: '1',
          age: (values.age as number) ?? undefined,
        },
      ],
    }; */

    postCreateEstimation({
      client: client as Client,
      headers: {
        Authorization: ``,
      },
      body: {
        employer_currency_slug: values.currency as string,
        employments: [],
      },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
    setSavedValues(values);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <SelectField
            name="country"
            label="Country"
            options={optionsCountries}
          />

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
      {savedValues && (
        <div>
          <h2>Saved Values</h2>
          <pre>{JSON.stringify(savedValues, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
