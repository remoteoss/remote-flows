import {
  CostCalculatorEstimateParams,
  getIndexCompanyCurrency,
  getIndexCountry,
  getShowRegionField,
  postCreateEstimation,
} from '@/src/client';
import { useClient } from '@/src/RemoteFlowsProvider';
import type { Field } from '@/src/types/fields';
import { BaseFlow } from '@/src/types/hooks';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { string } from 'yup';
import { fields } from './fields';

type CostCalculatorCountry = {
  value: string;
  label: string;
  childRegions: any[];
  hasAdditionalFields: boolean;
  regionSlug: string;
};

const useCostCalculatorCountries = () => {
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
        value: country.region_slug,
        label: country.name,
        childRegions: country.child_regions,
        hasAdditionalFields: country.has_additional_fields,
        regionSlug: country.region_slug,
      })) as CostCalculatorCountry[],
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

const useCostCalculatorEstimation = () => {
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

const useRegionFields = (region: string | undefined) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['cost-calculator-region-fields', region],
    queryFn: () => {
      return getShowRegionField({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { slug: region as string },
      });
    },
    enabled: !!region,
    select: ({ data }) =>
      createHeadlessForm(data?.data?.schema || {}, {
        strictInputType: false,
      }),
  });
};

/**
 * Hook to use the cost calculator.
 */
export const useCostCalculator = (): BaseFlow<CostCalculatorEstimateParams> => {
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [selectedCountry, setSelectedCountry] =
    useState<CostCalculatorCountry>();
  const { data: countries } = useCostCalculatorCountries();
  const { data: currencies } = useCompanyCurrencies();
  const { data: jsonSchemaRegionFields } = useRegionFields(
    selectedRegion || selectedCountry?.value,
  );
  const costCalculatorEstimationMutation = useCostCalculatorEstimation();

  /**
   * Submit the estimation form with the given values.
   * @param values
   */
  async function onSubmit(values: CostCalculatorEstimateParams) {
    return costCalculatorEstimationMutation.mutateAsync(values);
  }

  /**
   * If the selected country has no child regions and has additional fields,
   * set the current region to the country's region slug and fetch the region fields.
   * @param country
   */
  function onCountryChange(country: string) {
    const selectedCountry = countries?.find(({ value }) => value === country);

    if (
      selectedCountry &&
      selectedCountry.childRegions.length === 0 &&
      selectedCountry.hasAdditionalFields
    ) {
      setSelectedRegion(selectedCountry.regionSlug);
    } else {
      setSelectedRegion(undefined);
    }

    setSelectedCountry(selectedCountry);
  }

  /**
   * Update the selected region and fetch the region fields.
   * @param region
   */
  function onRegionChange(region: string) {
    setSelectedRegion(region);
  }

  const regionField = fields.find((field) => field.name === 'region');
  if (regionField) {
    const regions =
      selectedCountry?.childRegions.map((region) => ({
        value: region.slug,
        label: region.name,
      })) ?? [];
    regionField.options = regions;
    regionField.isVisible = regions.length > 0;
    regionField.required = regions.length > 0;
    regionField.onChange = onRegionChange;
    regionField.schema =
      regions.length > 0 ? string().required('Currency is required') : string();
  }

  if (currencies) {
    const currencyField = fields.find((field) => field.name === 'currency');
    if (currencyField) {
      currencyField.options = currencies;
    }
  }

  if (countries) {
    const countryField = fields.find((field) => field.name === 'country');
    if (countryField) {
      countryField.options = countries;
      countryField.onChange = onCountryChange;
    }
  }

  return {
    stepState: {
      current: 0,
      total: 1,
      isLastStep: true,
    },
    fields: [...fields, ...(jsonSchemaRegionFields?.fields || [])] as Field[],
    handleValidation: jsonSchemaRegionFields?.handleValidation,
    onSubmit,
  };
};
