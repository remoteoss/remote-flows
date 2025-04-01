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
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { string, ValidationError } from 'yup';
import { fields } from './fields';
import { buildPayload, buildValidationSchema } from './utils';

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
  }: {
    includePremiumBenefits: CostCalculatorEstimationOptions['includePremiumBenefits'];
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
    select: ({ data }) =>
      createHeadlessForm(data?.data?.schema || {}, {
        strictInputType: false,
      }),
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
};

export type EstimationError = PostCreateEstimationError | ValidationError;

/**
 * Hook to use the cost calculator.
 */
export const useCostCalculator = (
  { defaultRegion, estimationOptions }: UseCostCalculatorParams = {
    estimationOptions: defaultEstimationOptions,
  },
) => {
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

  const resetForm = () => {
    setSelectedCountry(undefined);
    setSelectedRegion(defaultRegion);
  };

  const allFields = [
    ...fields,
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

/**
 * Custom hook to fetch disclaimer information.
 *
 * This hooks returns the disclaimer html content.
 *
 * @returns {object} - The query object containing the disclaimer data.
 */
export const useCostCalculatorDisclaimer = () => {
  const disclaimerData = {
    data: {
      id: 4668194326797,
      title: 'Disclaimer information on Cost of Employment calculations',
      body: '<h3 id="h_01HHJFVR5Q4F8A52F06EVG289R">Remote disclaimer</h3>\n<p>The estimate provides a transparent detailed breakdown for in-country statutory social contributions, statutory benefits, and other benefits that may be required. Estimates do not take into account additional costs that may be incurred for relocation, visa, right-to-work requirements, or other activities. </p>\n<p><strong>See also:</strong> <a href="https://support.remote.com/hc/en-us/articles/22329255813133">What other type of costs does the Cost Calculator not include?</a></p>\n<h3 id="h_01HHJFVYRAAGDKJ36EZS8W6P5N">EOR services</h3>\n<p>Our EOR services allow you to retain ownership of your employees\' IP and inventions. Compliance, taxes, and payroll are handled by our local teams for a seamless end-to-end experience.</p>\n<h3 id="h_01HHJFW4FQPGPK14FSM4XCY5MR">Pricing and payroll</h3>\n<p>When it comes to payroll, legal and operational complexities are reduced to a single invoice for all of your Remote employees across every country you hire in – no hidden costs and no long-term commitments needed. Just a simple pricing structure that includes a fixed hiring fee for each EOR employee.</p>\n<h3 id="01JMCR2YZ0GVTCXNPY88TADWQ1">Currency conversions</h3>\n<p>When the employee currency differs from the billing currency, we use market rates to convert. The rate figures on this quote are a rough estimate. When the employee currency differs from the billing currency, we use market rates to convert. The rate figures on this quote are a rough estimated.</p>\n<h3 id="h_01HHJFWD1TFB5DQ6B4WD5F1GY6">Employee off-boarding related costs</h3>\n<p>The estimate here does not include any costs related to off-boarding of employees. Whilst we do not charge any processing fees when you want to off-board an employee, any other costs such as severance pay, covering remaining vacation days and etc will be charged back to you.<br><strong>See also: </strong><a href="https://support.remote.com/hc/en-us/articles/22329371247885">Are the costs of employee off-boarding included in the Cost Calculator?</a></p>\n<p>Please note the ‘employee net income estimate’ section (if available for the country) is intended for informational purposes only and should not be used as a substitute for professional financial advice.</p>\n<p>Additionally, tax laws and rates can vary by location and are subject to change, which may not be immediately reflected in the calculator.</p>\n<p>For a detailed and accurate assessment of your take-home pay, please consult with a qualified tax professional or financial advisor.</p>\n<p><strong>See also</strong>: <a href="https://support.remote.com/hc/en-us/articles/25196498469773">How to use the ‘employee net income estimate’ section in the Cost Calculator?</a></p>\n<p><!-- notionvc: 04d0e276-e0d7-4793-93ee-d4ad14600217 --></p>\n<h3 id="h_01HHJFWTHJ58YAZ87M3E090H4J">Note</h3>\n<p>This estimate is for guidance only and may not constitute accurate financial advice. Information contained in this document is subject to changes in laws in different jurisdictions, which can change without notice. This document is the property of Remote, is confidential, cannot be reproduced without permission, and cannot be disclosed to any third parties.</p>\n<p><!-- notionvc: 09e777b4-c10c-438e-bb95-ce1f3fb86c9a --></p>',
      html_url:
        'https://support.remote.com/hc/en-us/articles/4668194326797-Disclaimer-information-on-Cost-of-Employment-calculations',
    },
  };
  return useQuery({
    queryKey: ['cost-calculator-disclaimer'],
    queryFn: () => {
      return Promise.resolve(disclaimerData);
    },
  });
};
