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
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { object, ValidationError } from 'yup';
import type {
  FormErrors,
  ValidationResult,
} from '@remoteoss/remote-json-schema-form-kit';
import {
  buildManagementFeeRules,
  buildPayload,
  formErrorsToValidationErrors,
} from './utils';
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

type CostCalculatorCountry = {
  value: string;
  label: string;
  childRegions: MinimalRegion[];
  hasAdditionalFields: boolean | undefined;
  regionSlug: string;
  currency: string;
};

type CostCalculatorValidationResult = ValidationResult & {
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
  return createHeadlessForm(jsonSchema.data.schema, undefined, options);
};

const toOneOf = (items: Array<{ value: string; label: string }> = []) =>
  items.map(({ value, label }) => ({ const: value, title: label }));

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
  const useSplitSalaryDescription =
    options?.features?.includes('split_salary_description') ?? false;
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
            Component: (
              props: JSFField & { currencies: { from: string; to: string } },
            ) => {
              return (
                <SalaryField
                  {...props}
                  shouldSwapOrder={shouldSwapOrder}
                  conversionType={
                    version === 'marketing' ? 'no_spread' : 'spread'
                  }
                  defaultValue={defaultSalary}
                  splitDescription={useSplitSalaryDescription}
                />
              );
            },
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
              ...buildManagementFeeRules(employerBillingCurrency || 'USD'),
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
    useSplitSalaryDescription,
  ]);

  const regions =
    selectedCountry?.childRegions.map((region) => ({
      value: region.slug,
      label: region.name,
    })) ?? [];

  const fieldsJSONSchema = useStaticSchema({
    jsfModify: {
      fields: {
        ...options?.jsfModify?.fields,
        ...customFields?.fields,
        country: {
          ...options?.jsfModify?.fields?.country,
          oneOf: toOneOf(countries),
          presentation: { onChange: onCountryChange },
        },
        region: {
          ...options?.jsfModify?.fields?.region,
          oneOf: toOneOf(regions),
          presentation: {
            hidden: regions.length === 0,
            onChange: onRegionChange,
          },
        },
        currency: {
          ...options?.jsfModify?.fields?.currency,
          oneOf: toOneOf(currencies),
          presentation: { onChange: onChangeCurrency },
        },
        hiring_budget: {
          ...customFields.fields.hiring_budget,
          presentation: {
            ...customFields.fields.hiring_budget.presentation,
            onChange: onHiringBudgetChange,
          },
        },
      },
      required: [
        ...(regions.length > 0 ? ['region'] : []),
        ...(estimationOptions.includeEstimationTitle
          ? ['estimation_title']
          : []),
      ],
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

  function onHiringBudgetChange(value: string) {
    setHiringBudget(value as HiringBudget);
  }

  function onChangeCurrency(currency: string) {
    const selectedCurrency = currencies?.find(
      (c) => c.value === currency,
    )?.label;
    setEmployerBillingCurrency(selectedCurrency);
    options?.onCurrencyChange?.(selectedCurrency || '');
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

  const staticFieldNames = new Set(
    fieldsJSONSchema.fields.map((field) => field.name as string),
  );
  const regionFieldNames = new Set(
    (jsonSchemaRegionFields?.fields || []).map((field) => field.name as string),
  );

  function pickFieldValues(
    values: Record<string, unknown>,
    fieldNames: Set<string>,
  ) {
    return Object.fromEntries(
      Object.entries(values).filter(([name]) => fieldNames.has(name)),
    ) as $TSFixMe;
  }

  async function handleValidation(
    values: CostCalculatorEstimationFormValues,
  ): Promise<CostCalculatorValidationResult> {
    options?.onValidation?.(values);
    const parsedValues = await parseJSFToValidate(values, allFields);

    const staticFieldsResult = fieldsJSONSchema.handleValidation(
      pickFieldValues(parsedValues, staticFieldNames),
    );
    const regionFieldsResult = jsonSchemaRegionFields?.handleValidation(
      pickFieldValues(parsedValues, regionFieldNames),
    );

    const formErrors: FormErrors = {
      ...staticFieldsResult?.formErrors,
      ...regionFieldsResult?.formErrors,
    };

    return {
      formErrors,
      yupError: new ValidationError(
        formErrorsToValidationErrors(formErrors),
        parsedValues,
      ),
    };
  }

  const validationSchema = object().test(
    'cost-calculator',
    'Invalid cost calculator values',
    async function (values) {
      const { formErrors } = await handleValidation(
        values as unknown as CostCalculatorEstimationFormValues,
      );
      const errors = formErrorsToValidationErrors(formErrors);
      return errors.length === 0 || new ValidationError(errors, values);
    },
  );

  // WE NEED TO FIX: react-hooks/refs - Cannot access ref value during render
  // oxlint-disable-next-line react-hooks/refs
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
     * Yup schema delegating to `handleValidation`, kept for backwards compatibility
     * @deprecated use `handleValidation` instead
     */
    validationSchema,
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: async (
      values: CostCalculatorEstimationFormValues,
    ): Promise<CostCalculatorEstimationSubmitValues> => {
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

      const parsedStaticFields = await parseJSFToValidate(
        jsonSchemaStaticFieldValues,
        fieldsJSONSchema.fields,
      );

      const parsedRegionFields = await parseJSFToValidate(
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
    // WE NEED TO FIX: react-hooks/refs - Cannot access ref value during render
    // oxlint-disable-next-line react-hooks/refs
    meta: {
      // WE NEED TO FIX: react-hooks/refs - Cannot access ref value during render
      // oxlint-disable-next-line react-hooks/refs
      fields: fieldsMetaRef.current?.fields,
    },
  };
};
