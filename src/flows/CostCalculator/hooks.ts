import {
  CostCalculatorEstimateParams,
  getIndexCompanyCurrency,
  getIndexCountry,
  getShowRegionField,
  postCreateEstimation,
} from '@/src/client';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Control, useWatch } from 'react-hook-form';

export const useCostCalculatorCountries = () => {
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

export const useCalculatorLoadRegionFieldsSchemaForm = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>,
) => {
  const { client } = useClient();
  const { data: countries = [] } = useCostCalculatorCountries();
  const region = useWatch({ name: 'region', control });
  const country = useWatch({ name: 'country', control });

  const selectedCountry = countries?.find((c) => c.value === country);

  let regionSlug = region;
  if (
    selectedCountry &&
    selectedCountry.childRegions.length === 0 &&
    selectedCountry.hasAdditionalFields
  ) {
    regionSlug = selectedCountry.regionSlug;
  }

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

export const useCompanyCurrencies = () => {
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
        value: currency.code,
        label: currency.code,
        slug: currency.slug,
      })),
  });
};

export const useCostCalculatorEstimation = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: (payload: CostCalculatorEstimateParams) => {
      return postCreateEstimation({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};
