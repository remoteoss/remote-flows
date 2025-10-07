import { MinimalRegion } from '@/src/client';
import { jsonSchema } from '@/src/flows/CostCalculator/jsonSchema';
import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  UseCostCalculatorOptions,
} from '@/src/flows/CostCalculator/types';
import type { JSFModify } from '@/src/flows/types';

import { parseJSFToValidate } from '@/src/components/form/utils';
import { iterateErrors } from '@/src/components/form/yupValidationResolver';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { string, ValidationError } from 'yup';
import { buildPayload, buildValidationSchema } from './utils';
import {
  useCompanyCurrencies,
  useCostCalculatorCountries,
  useCostCalculatorEstimation,
  useRegionFields,
} from '@/src/flows/CostCalculator/api';
import { $TSFixMe, JSFField, Meta } from '@/src/types/remoteFlows';
import { SalaryField } from '@/src/flows/CostCalculator/components/SalaryField';
import {
  FieldSetField,
  FieldSetProps,
} from '@/src/components/form/fields/FieldSetField';
import { mutationToPromise } from '@/src/lib/mutations';
export type CostCalculatorVersion = 'standard' | 'marketing';

const createSalaryFieldComponent =
  (
    defaultSalary: string | undefined,
    version: CostCalculatorVersion | undefined,
    shouldSwapOrder: boolean,
  ) =>
  (props: JSFField & { currencies: { from: string; to: string } }) => {
    return (
      <SalaryField
        {...props}
        shouldSwapOrder={shouldSwapOrder}
        conversionType={version === 'marketing' ? 'no_spread' : 'spread'}
        defaultValue={defaultSalary}
      />
    );
  };

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
  includeEstimationTitle: false,
  includeManagementFee: false,
};

type UseCostCalculatorParams = {
  /**
   * The default region slug to preselect a country and a region.
   */
  defaultRegion?: string;
  /**
   * The default currency slug to preselect a currency.
   */
  defaultCurrency?: string;

  /**
   * The default salary to preselect a salary.
   */
  defaultSalary?: string;
  /**
   * The estimation options.
   */
  estimationOptions: CostCalculatorEstimationOptions;
  options?: UseCostCalculatorOptions;
  version?: CostCalculatorVersion;
};

const useStaticSchema = (options?: { jsfModify?: JSFModify }) => {
  const { schema: jsonSchemaModified } = modify(
    jsonSchema.data.schema,
    options?.jsfModify || {},
  );

  return createHeadlessForm(jsonSchemaModified);
};

type HiringBudget = 'my_hiring_budget' | 'employee_annual_salary';

function getSalaryTitle(
  salaryField: unknown,
  hiringBudget?: HiringBudget,
): string {
  if (
    typeof salaryField === 'object' &&
    salaryField !== null &&
    'title' in salaryField
  ) {
    const title = (salaryField as { title?: string }).title;
    if (title) return title;
  }
  return hiringBudget === 'my_hiring_budget'
    ? 'Hiring budget'
    : "Employee's annual salary";
}

/**
 * Hook to use the cost calculator.
 */
export const useCostCalculator = (
  {
    defaultRegion,
    defaultCurrency,
    defaultSalary,
    estimationOptions,
    options,
    version,
  }: UseCostCalculatorParams = {
    estimationOptions: defaultEstimationOptions,
  },
) => {
  const fieldsMetaRef = useRef<{
    fields: Meta;
  }>({
    fields: {},
  });

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    defaultRegion,
  );
  const [selectedCountry, setSelectedCountry] =
    useState<CostCalculatorCountry>();
  const [employerBillingCurrency, setEmployerBillingCurrency] = useState<
    string | undefined
  >();
  const [hiringBudget, setHiringBudget] = useState<HiringBudget>();
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
  const { mutateAsync: costCalculatorEstimationMutationAsync } =
    mutationToPromise(costCalculatorEstimationMutation);
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

  const getCurrencies = useCallback(() => {
    const shouldSwapOrder =
      employeeBillingCurrency && employerBillingCurrency
        ? employeeBillingCurrency !== employerBillingCurrency
        : false;

    if (employeeBillingCurrency !== employerBillingCurrency) {
      return {
        from: employerBillingCurrency,
        to: employeeBillingCurrency,
        shouldSwapOrder,
      };
    }

    return {
      from: employeeBillingCurrency,
      to: employerBillingCurrency,
      shouldSwapOrder,
    };
  }, [employeeBillingCurrency, employerBillingCurrency]);

  const showManagementField = estimationOptions.showManagementFee;
  const showEstimationTitleField = estimationOptions.includeEstimationTitle;

  const customFields = useMemo(() => {
    const { from, to, shouldSwapOrder } = getCurrencies();
    const salaryTitle = getSalaryTitle(salaryField, hiringBudget);

    return {
      fields: {
        salary: {
          ...salaryField,
          title: salaryTitle,
          presentation: {
            salary_conversion_properties: {
              label:
                salaryFieldPresentation?.salary_conversion_properties?.label,
              description:
                salaryFieldPresentation?.salary_conversion_properties
                  ?.description,
            },
            currencies: { from, to },
            Component: createSalaryFieldComponent(
              defaultSalary,
              version,
              shouldSwapOrder,
            ),
          },
        },
        hiring_budget: {
          ...options?.jsfModify?.fields?.hiring_budget,
          presentation: {
            hidden: version == 'marketing',
          },
        },
        management: {
          ...options?.jsfModify?.fields?.management,
          properties: {
            ...(options?.jsfModify?.fields?.management as $TSFixMe)?.properties,
            management_fee: {
              ...(options?.jsfModify?.fields?.management as $TSFixMe)
                ?.properties?.management_fee,
              'x-jsf-presentation': {
                inputType: 'money',
                additionalProps: {
                  currency: employerBillingCurrency || 'USD',
                },
              },
            },
          },
          presentation: {
            ...(typeof options?.jsfModify?.fields?.management === 'object'
              ? (
                  options?.jsfModify?.fields?.management as Record<
                    string,
                    $TSFixMe
                  >
                )['x-jsf-presentation']
              : {}),
            hidden: !showManagementField,
            Component: (props: FieldSetProps) => {
              return (
                <FieldSetField
                  {...props}
                  variant='inset'
                  features={{
                    toggle: {
                      enabled: true,
                      stateField: 'management._expanded',
                      labels: {
                        expand: 'Define',
                        collapse: 'Remove',
                      },
                    },
                  }}
                />
              );
            },
          },
        },
        estimation_title: {
          ...options?.jsfModify?.fields?.estimation_title,
          'x-jsf-presentation': {
            hidden: !showEstimationTitleField,
          },
        },
      },
    };
  }, [
    getCurrencies,
    salaryField,
    hiringBudget,
    salaryFieldPresentation?.salary_conversion_properties?.label,
    salaryFieldPresentation?.salary_conversion_properties?.description,
    options?.jsfModify?.fields?.hiring_budget,
    options?.jsfModify?.fields?.management,
    options?.jsfModify?.fields?.estimation_title,
    version,
    employerBillingCurrency,
    showManagementField,
    showEstimationTitleField,
    defaultSalary,
  ]);

  const fieldsJSONSchema = useStaticSchema({
    jsfModify: {
      fields: {
        ...options?.jsfModify?.fields,
        ...customFields?.fields,
      },
    },
  });

  useEffect(() => {
    // Initialize selectedCountry from defaultRegion
    if (defaultRegion && countries) {
      const defaultCountry = countries.find(
        ({ value }) => value === defaultRegion,
      );
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
      }
    }
  }, [defaultRegion, countries]);

  useEffect(() => {
    // Initialize selectedCurrency from defaultCurrency
    if (defaultCurrency && currencies) {
      const defaultCurrencyObj = currencies.find(
        ({ value }) => value === defaultCurrency,
      );
      if (defaultCurrencyObj) {
        setEmployerBillingCurrency(defaultCurrencyObj.label);
      }
    }
  }, [defaultCurrency, currencies]);

  /**
   * Submit the estimation form with the given values.
   * @param values
   */
  async function onSubmit(values: CostCalculatorEstimationSubmitValues) {
    return costCalculatorEstimationMutationAsync(
      buildPayload(values, estimationOptions, version),
    );
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

  function onHiringBudgetChange(event: React.ChangeEvent<HTMLInputElement>) {
    setHiringBudget(event.target.value as HiringBudget);
  }

  function onChangeCurrency(currency: string) {
    const selectedCurrency = currencies?.find(
      (c) => c.value === currency,
    )?.label;
    setEmployerBillingCurrency(selectedCurrency);
    options?.onCurrencyChange?.(selectedCurrency || '');
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

  const hiringBudgetField = fieldsJSONSchema.fields.find(
    (field) => field.name === 'hiring_budget',
  );
  if (hiringBudgetField) {
    hiringBudgetField.onChange = onHiringBudgetChange;
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
    ...fieldsJSONSchema.fields.filter((field) => field.name !== 'management'),
    ...(jsonSchemaRegionFields?.fields || []),
    ...fieldsJSONSchema.fields.filter((field) => field.name === 'management'),
  ];

  const validationSchema = buildValidationSchema(
    fieldsJSONSchema.fields,
    employerBillingCurrency || 'USD',
    estimationOptions.includeEstimationTitle,
  );

  async function handleValidation(values: CostCalculatorEstimationFormValues) {
    let errors: JSFValidationError | null = null;

    options?.onValidation?.(values);
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
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState: {
      current: 0,
      total: 1,
      isLastStep: true,
    },
    /**
     * Array of form fields from the cost calculator schema + dynamic region fields like benefits, age, etc.
     */
    fields: allFields,
    /**
     * Validation schema for the cost calculator form
     */
    validationSchema,
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (
      values: CostCalculatorEstimationFormValues,
    ): CostCalculatorEstimationSubmitValues => {
      const {
        country,
        region,
        currency,
        salary_converted,
        hiring_budget,
        salary_conversion,
        management,
        estimation_title,
        ...rest
      } = values;

      // If the salary has been converted, we take the one the user has inputted
      let salary = values.salary;
      if (salary_converted === 'salary_conversion') {
        salary = salary_conversion;
      }

      const jsonSchemaStaticFieldValues = {
        country,
        region,
        salary,
        salary_converted,
        salary_conversion,
        hiring_budget,
        currency,
        management,
        estimation_title,
      };

      const parsedStaticFields = parseJSFToValidate(
        jsonSchemaStaticFieldValues,
        fieldsJSONSchema.fields,
      );

      const parsedRegionFields = parseJSFToValidate(
        rest,
        jsonSchemaRegionFields?.fields || [],
      );

      const additionalFields = {
        currency_code: currencies?.find((c) => c.value === currency)?.label,
      };

      return {
        ...parsedStaticFields,
        ...parsedRegionFields,
        ...additionalFields,
      } as CostCalculatorEstimationSubmitValues;
    },
    /**
     * Function to handle validation of the cost calculator form
     * @param values - Form values to validate
     * @returns Validation result
     */
    handleValidation,
    /**
     * Whether the cost calculator form is currently being submitted
     */
    isSubmitting: costCalculatorEstimationMutation.isPending,
    /**
     * Whether the cost calculator form is currently loading
     */
    isLoading:
      isLoadingCountries && isLoadingCurrencies && isLoadingRegionFields,
    /**
     * Function to submit the cost calculator form
     */
    onSubmit,
    /**
     * Function to reset the cost calculator form
     */
    resetForm,

    /**
     * Currencies data useful to get the currency if you have a currencySlug
     */
    currencies,

    /**
     * Fields metadata
     */
    meta: {
      fields: fieldsMetaRef.current?.fields,
    },
  };
};
