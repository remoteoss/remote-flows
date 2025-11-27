import { createHeadlessForm, modify } from '@remoteoss/json-schema-form-old';
import {
  CostCalculatorEstimateParams,
  getIndexCompanyCurrency,
  getIndexCountry,
  getShowRegionField,
  postCreateEstimation,
  postCreateEstimationCsv,
  postCreateEstimationPdf,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CostCalculatorEstimationOptions } from '@/src/flows/CostCalculator/types';
import { JSFModify } from '@/src/flows/types';

/**
 * Hook to fetch the countries for the cost calculator.
 * @returns
 */
export const useCostCalculatorCountries = ({
  includePremiumBenefits,
}: {
  includePremiumBenefits: CostCalculatorEstimationOptions['includePremiumBenefits'];
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['cost-calculator-countries', includePremiumBenefits],
    queryFn: () => {
      return getIndexCountry({
        client: client as Client,
        query: {
          include_premium_benefits: includePremiumBenefits,
        },
      });
    },
    select: (data) =>
      data.data?.data
        .filter((country) => country.availability === 'active')
        .map((country) => ({
          value: country.region_slug,
          label: country.name,
          childRegions: country.child_regions,
          hasAdditionalFields: country.has_additional_fields,
          regionSlug: country.region_slug,
          currency: country.currency.code,
        })),
  });
};

/**
 * Hook to fetch the company currencies.
 * @returns
 */
export const useCompanyCurrencies = () => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['company-currencies'],
    queryFn: () => {
      return getIndexCompanyCurrency({
        client: client as Client,
      });
    },
    select: (data) =>
      data.data?.data?.company_currencies.map((currency) => ({
        value: currency.slug,
        label: currency.code,
      })),
  });
};

/**
 * Hook to create an estimation.
 * @returns
 */
export const useCostCalculatorEstimation = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: (payload: CostCalculatorEstimateParams) => {
      return postCreateEstimation({
        client: client as Client,
        body: payload,
      });
    },
  });
};

/**
 * Custom hook to create a PDF estimation.
 *
 * @returns
 */
export const useCostCalculatorEstimationPdf = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: (payload: CostCalculatorEstimateParams) => {
      return postCreateEstimationPdf({
        client: client as Client,
        body: payload,
      });
    },
  });
};

/**
 * Custom hook to create a CSV estimation.
 *
 * @returns
 */
export const useCostCalculatorEstimationCsv = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CostCalculatorEstimateParams) => {
      return postCreateEstimationCsv({
        client: client as Client,
        body: payload,
      });
    },
  });
};

/**
 * Hook to fetch the region fields.
 * @param region
 * @returns
 */
export const useRegionFields = (
  region: string | undefined,
  {
    includePremiumBenefits,
    options,
  }: {
    includePremiumBenefits: CostCalculatorEstimationOptions['includePremiumBenefits'];
    options?: {
      jsfModify?: JSFModify;
    };
  },
) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['cost-calculator-region-fields', region, includePremiumBenefits],
    queryFn: () => {
      return getShowRegionField({
        client: client as Client,
        path: { slug: region as string },
        query: {
          include_premium_benefits: includePremiumBenefits,
        },
      });
    },
    enabled: !!region,
    select: ({ data }) => {
      let jsfSchema = data?.data?.schema || {};
      if (options && options.jsfModify) {
        const { schema } = modify(jsfSchema, options.jsfModify);
        jsfSchema = schema;
      }
      return createHeadlessForm(jsfSchema);
    },
  });
};
