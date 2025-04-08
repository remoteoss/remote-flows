import {
  CostCalculatorEstimateParams,
  CostCalculatorEstimateResponse,
  getIndexCompanyCurrency,
  getIndexCountry,
  getShowRegionField,
  MinimalRegion,
  postCreateEstimation,
  PostCreateEstimationError,
  postCreateEstimationPdf,
} from '@/src/client';
import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
  Field,
} from '@/src/flows/CostCalculator/types';
import type { Result } from '@/src/flows/types';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { string, ValidationError } from 'yup';
import { buildPayload, buildValidationSchema } from './utils';
import { jsonSchema } from '@/src/flows/CostCalculator/jsonSchema';

type CostCalculatorCountry = {
  value: string;
  label: string;
  childRegions: MinimalRegion[];
  hasAdditionalFields: boolean | undefined;
  regionSlug: string;
};

/**
 * Hook to fetch the countries for the cost calculator.
 * @returns
 */
const useCostCalculatorCountries = ({
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
        headers: {
          Authorization: ``,
        },
        query: {
          include_premium_benefits: includePremiumBenefits,
        },
      });
    },
    select: (data) =>
      data.data?.data.map((country) => ({
        value: country.region_slug,
        label: country.name,
        childRegions: country.child_regions,
        hasAdditionalFields: country.has_additional_fields,
        regionSlug: country.region_slug,
      })),
  });
};

/**
 * Hook to fetch the company currencies.
 * @returns
 */
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
        headers: {
          Authorization: ``,
        },
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
const useRegionFields = (
  region: string | undefined,
  {
    includePremiumBenefits,
    options,
  }: {
    includePremiumBenefits: CostCalculatorEstimationOptions['includePremiumBenefits'];
    options: any;
  },
) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['cost-calculator-region-fields', region, includePremiumBenefits],
    queryFn: () => {
      return getShowRegionField({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { slug: region as string },
        query: {
          include_premium_benefits: includePremiumBenefits,
        },
      });
    },
    enabled: !!region,
    select: ({ data }) => {
      let jsfSchema = data?.data || {};

      if (
        options &&
        options.jsfModify &&
        jsfSchema.schema &&
        Object.keys(jsfSchema.schema.properties).length > 0
      ) {
        const { schema } = modify(jsfSchema.schema, options.jsfModify);
        jsfSchema = schema;
      }
      if (
        jsfSchema.schema &&
        Object.keys(jsfSchema.schema.properties).length > 0
      ) {
        return createHeadlessForm(jsfSchema.schema);
      }

      return null;
    },
  });
};

export const defaultEstimationOptions: CostCalculatorEstimationOptions = {
  title: 'Estimation',
  includeBenefits: false,
  includeCostBreakdowns: false,
  includePremiumBenefits: false,
};

type UseCostCalculatorParams = {
  /**
   * The default region slug to preselect a country and a region.
   */
  defaultRegion?: string;
  /**
   * The estimation options.
   */
  estimationOptions: CostCalculatorEstimationOptions;
  options?: any;
};

export type EstimationError = PostCreateEstimationError | ValidationError;

/**
 * Hook to use the cost calculator.
 */
export const useCostCalculator = (
  { defaultRegion, estimationOptions, options }: UseCostCalculatorParams = {
    estimationOptions: defaultEstimationOptions,
  },
) => {
  const { schema: jsonSchemaModified } = modify(
    jsonSchema.data.schema,
    options?.jsfModify || {},
  );

  const fieldsJSONSchema = createHeadlessForm(jsonSchemaModified);

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    defaultRegion,
  );
  const [selectedCountry, setSelectedCountry] =
    useState<CostCalculatorCountry>();
  const { data: countries, isLoading: isLoadingCountries } =
    useCostCalculatorCountries({
      includePremiumBenefits: estimationOptions.includePremiumBenefits,
    });
  const { data: currencies, isLoading: isLoadingCurrencies } =
    useCompanyCurrencies();

  const jsonSchemaRegionSlug = selectedRegion || selectedCountry?.value;

  const { data: jsonSchemaRegionFields, isLoading: isLoadingRegionFields } =
    useRegionFields(jsonSchemaRegionSlug, {
      includePremiumBenefits: estimationOptions.includePremiumBenefits,
      options,
    });
  const costCalculatorEstimationMutation = useCostCalculatorEstimation();

  /**
   * Submit the estimation form with the given values.
   * @param values
   */
  async function onSubmit(
    values: CostCalculatorEstimationFormValues,
  ): Promise<Result<CostCalculatorEstimateResponse, EstimationError>> {
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (err) {
      return {
        data: null,
        error: err as ValidationError,
      };
    }

    return new Promise((resolve, reject) => {
      costCalculatorEstimationMutation.mutate(
        buildPayload(values, estimationOptions),
        {
          onSuccess: (response) => {
            if (response.data) {
              resolve({
                data: response.data,
                error: null,
              });
            } else {
              resolve({
                data: null,
                error: new Error(
                  'Something went wrong. Please try again later.',
                ),
              });
            }
          },
          onError: (error) => {
            reject({
              data: null,
              error: error as PostCreateEstimationError,
            });
          },
        },
      );
    });
  }

  /**
   * If the selected country has no child regions and has additional fields,
   * set the current region to the country's region slug and fetch the region fields.
   * @param country
   */
  function onCountryChange(country: string) {
    const currentCountry = countries?.find(({ value }) => value === country);

    if (
      currentCountry &&
      currentCountry.childRegions.length === 0 &&
      currentCountry.hasAdditionalFields
    ) {
      setSelectedRegion(currentCountry.regionSlug);
    } else {
      setSelectedRegion(undefined);
    }
    setSelectedCountry(currentCountry);
  }

  /**
   * Update the selected region and fetch the region fields.
   * @param region
   */
  function onRegionChange(region: string) {
    setSelectedRegion(region);
  }

  const regionField = fieldsJSONSchema.fields.find(
    (field) => field.name === 'region',
  );

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
      regions.length > 0 ? string().required('Region is required') : string();
  }

  if (currencies) {
    const currencyField = fieldsJSONSchema.fields.find(
      (field) => field.name === 'currency',
    );
    if (currencyField) {
      currencyField.options = currencies;
    }
  }

  if (countries) {
    console.log({ countries });
    const countryField = fieldsJSONSchema.fields.find(
      (field) => field.name === 'country',
    );
    console.log({ countryField });
    if (countryField) {
      countryField.options = countries;
      console.log('setting onCountryChange');
      countryField.onChange = onCountryChange;
    }
  }

  const resetForm = () => {
    setSelectedCountry(undefined);
    setSelectedRegion(defaultRegion);
  };

  const allFields = [
    ...fieldsJSONSchema.fields,
    ...(jsonSchemaRegionFields?.fields || []),
  ] as Field[];

  const validationSchema = buildValidationSchema(allFields);

  return {
    stepState: {
      current: 0,
      total: 1,
      isLastStep: true,
    },
    fields: allFields,
    validationSchema,
    handleValidation: jsonSchemaRegionFields?.handleValidation,
    isSubmitting: costCalculatorEstimationMutation.isPending,
    isLoading:
      isLoadingCountries && isLoadingCurrencies && isLoadingRegionFields,
    onSubmit,
    resetForm,
  };
};
