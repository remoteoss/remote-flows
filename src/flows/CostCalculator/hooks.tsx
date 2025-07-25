import {
  CostCalculatorEstimateResponse,
  MinimalRegion,
  PostCreateEstimationError,
} from '@/src/client';
import { jsonSchema } from '@/src/flows/CostCalculator/jsonSchema';
import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
} from '@/src/flows/CostCalculator/types';
import type { JSFModify, Result } from '@/src/flows/types';

import { parseJSFToValidate } from '@/src/components/form/utils';
import { iterateErrors } from '@/src/components/form/yupValidationResolver';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMemo, useState } from 'react';
import { string, ValidationError } from 'yup';
import { buildPayload, buildValidationSchema } from './utils';
import {
  useCompanyCurrencies,
  useCostCalculatorCountries,
  useCostCalculatorEstimation,
  useRegionFields,
} from '@/src/flows/CostCalculator/api';
import { JSFField } from '@/src/types/remoteFlows';
import { SalaryField } from '@/src/flows/CostCalculator/components/SalaryField';

export type CostCalculatorVersion = 'standard' | 'marketing';

type CostCalculatorCountry = {
  value: string;
  label: string;
  childRegions: MinimalRegion[];
  hasAdditionalFields: boolean | undefined;
  regionSlug: string;
  currency: string;
};

type JSFValidationError = {
  formErrors: Record<
    string,
    {
      type: string;
      message: string;
    }
  >;
  yupError: ValidationError;
};

export const defaultEstimationOptions: CostCalculatorEstimationOptions = {
  title: 'Estimation',
  includeBenefits: false,
  includeCostBreakdowns: false,
  includePremiumBenefits: false,
  enableCurrencyConversion: false,
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
  options?: {
    jsfModify?: JSFModify;
  };
  version?: CostCalculatorVersion;
};

export type EstimationError = PostCreateEstimationError | ValidationError;

const useStaticSchema = (options?: { jsfModify?: JSFModify }) => {
  const { schema: jsonSchemaModified } = modify(
    jsonSchema.data.schema,
    options?.jsfModify || {},
  );

  return createHeadlessForm(jsonSchemaModified);
};

/**
 * Hook to use the cost calculator.
 */
export const useCostCalculator = (
  {
    defaultRegion,
    estimationOptions,
    options,
    version,
  }: UseCostCalculatorParams = {
    estimationOptions: defaultEstimationOptions,
  },
) => {
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    defaultRegion,
  );
  const [selectedCountry, setSelectedCountry] =
    useState<CostCalculatorCountry>();
  const [employerBillingCurrency, setEmployerBillingCurrency] = useState<
    string | undefined
  >();
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
  const employeeBillingCurrency = selectedCountry?.currency;

  const salaryField = options?.jsfModify?.fields?.salary;
  const salaryFieldPresentation =
    salaryField &&
    typeof salaryField === 'object' &&
    'presentation' in salaryField
      ? (
          salaryField as {
            presentation?: {
              salary_conversion_properties?: {
                label?: string;
                description?: string;
              };
            };
          }
        ).presentation
      : undefined;

  const customFields = useMemo(() => {
    return {
      fields: {
        salary: {
          ...salaryField,
          presentation: {
            salary_conversion_properties: {
              label:
                salaryFieldPresentation?.salary_conversion_properties?.label,
              description:
                salaryFieldPresentation?.salary_conversion_properties
                  ?.description,
            },
            currencies: {
              from: employeeBillingCurrency,
              to: employerBillingCurrency,
            },
            Component: (
              props: JSFField & { currencies: { from: string; to: string } },
            ) => {
              return <SalaryField {...props} />;
            },
          },
        },
      },
    };
  }, [
    employeeBillingCurrency,
    employerBillingCurrency,
    salaryField,
    salaryFieldPresentation?.salary_conversion_properties?.description,
    salaryFieldPresentation?.salary_conversion_properties?.label,
  ]);

  const fieldsJSONSchema = useStaticSchema({
    jsfModify: {
      fields: {
        ...options?.jsfModify?.fields,
        ...customFields?.fields,
      },
    },
  });

  /**
   * Submit the estimation form with the given values.
   * @param values
   */
  async function onSubmit(
    values: CostCalculatorEstimationSubmitValues,
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
        buildPayload(values, estimationOptions, version),
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

  function onChangeCurrency(currency: string) {
    const selectedCurrency = currencies?.find(
      (c) => c.value === currency,
    )?.label;
    setEmployerBillingCurrency(selectedCurrency);
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
      regions.length > 0
        ? string()
            .transform((value) => (typeof value === 'string' ? value : ''))
            .required('Region is required')
        : string();
  }

  if (currencies) {
    const currencyField = fieldsJSONSchema.fields.find(
      (field) => field.name === 'currency',
    );
    if (currencyField) {
      currencyField.options = currencies;
      currencyField.onChange = onChangeCurrency;
    }
  }

  if (countries) {
    const countryField = fieldsJSONSchema.fields.find(
      (field) => field.name === 'country',
    );
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
    ...fieldsJSONSchema.fields,
    ...(jsonSchemaRegionFields?.fields || []),
  ];

  const validationSchema = buildValidationSchema(fieldsJSONSchema.fields);

  async function handleValidation(values: CostCalculatorEstimationFormValues) {
    let errors: JSFValidationError | null = null;

    const parsedValues = parseJSFToValidate(values, allFields);

    // 1. validate static fields first using Yup validate function
    try {
      await validationSchema.validate(parsedValues, {
        abortEarly: false,
      });
      errors = {
        formErrors: {},
        yupError: new ValidationError([], values),
      };
    } catch (error) {
      const iterateResult = iterateErrors(error as ValidationError);

      errors = {
        // convert the errors to a format that can be used in the form
        formErrors: Object.entries(iterateResult).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value.message }),
          {},
        ),
        yupError: error as ValidationError,
      };
    }

    // 2. validate json schema fields using the handleValidation (from json-schema-form)
    const handleValidationResult =
      jsonSchemaRegionFields?.handleValidation(parsedValues);

    // 3. combine the errors from both validations
    const combinedInnerErrors = [
      ...(errors?.yupError.inner || []),
      ...(handleValidationResult?.yupError?.inner || []),
    ];
    const combinedValues = {
      ...(errors?.yupError?.value || {}),
      ...(handleValidationResult?.yupError?.value || {}),
    };

    return {
      formErrors: {
        ...(errors?.formErrors || {}),
        ...(handleValidationResult?.formErrors || {}),
      },
      yupError: new ValidationError(combinedInnerErrors, combinedValues),
    };
  }

  return {
    stepState: {
      current: 0,
      total: 1,
      isLastStep: true,
    },
    fields: allFields,
    validationSchema,
    parseFormValues: (
      values: CostCalculatorEstimationFormValues,
    ): CostCalculatorEstimationSubmitValues => {
      const { country, region, salary, currency, ...rest } = values;
      const jsonSchemaStaticFieldValues = {
        country,
        region,
        salary,
        currency,
      };
      const parsedStaticFields = parseJSFToValidate(
        jsonSchemaStaticFieldValues,
        fieldsJSONSchema.fields,
      );

      const parsedRegionFields = parseJSFToValidate(
        rest,
        jsonSchemaRegionFields?.fields || [],
      );

      return {
        ...parsedStaticFields,
        ...parsedRegionFields,
      } as CostCalculatorEstimationSubmitValues;
    },
    handleValidation,
    isSubmitting: costCalculatorEstimationMutation.isPending,
    isLoading:
      isLoadingCountries && isLoadingCurrencies && isLoadingRegionFields,
    onSubmit,
    resetForm,
  };
};
