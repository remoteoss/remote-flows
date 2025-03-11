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
  regionSlug: string | null,
) => {
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
        value: currency.slug,
        label: currency.code,
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
