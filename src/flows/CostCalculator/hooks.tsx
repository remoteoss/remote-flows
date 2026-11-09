import { MinimalRegion } from '@/src/client';
import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  UseCostCalculatorOptions,
} from '@/src/flows/CostCalculator/types';

import { parseJSFToValidate } from '@/src/components/form/utils';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildCostCalculatorSchema,
  buildPayload,
  buildValidationSchema,
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

type ModifyFieldAttrs = Record<string, unknown> & {
  presentation?: Record<string, unknown>;
  'x-jsf-presentation'?: Record<string, unknown>;
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

const withPresentation = (
  field: unknown,
  presentation: Record<string, unknown>,
) => {
  const attrs = (
    typeof field === 'object' && field !== null ? field : {}
  ) as ModifyFieldAttrs;
  return {
    ...attrs,
    presentation: {
      ...attrs['x-jsf-presentation'],
      ...attrs.presentation,
      ...presentation,
    },
  };
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
    if (title) {
      return title;
    }
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
    // oxlint-disable-next-line typescript/no-deprecated
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
  // oxlint-disable-next-line typescript/no-deprecated
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

  const regions = useMemo(
    () =>
      selectedCountry?.childRegions.map((region) => ({
        value: region.slug,
        label: region.name,
      })) ?? [],
    [selectedCountry],
  );

  const onCurrencyChangeRef = useRef(options?.onCurrencyChange);
  useEffect(() => {
    onCurrencyChangeRef.current = options?.onCurrencyChange;
  }, [options?.onCurrencyChange]);

  /**
   * If the selected country has no child regions and has additional fields,
   * set the current region to the country's region slug and fetch the region fields.
   * @param country
   */
  const onCountryChange = useCallback(
    (country: string) => {
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
    },
    [countries],
  );

  /**
   * Update the selected region and fetch the region fields.
   * @param region
   */
  const onRegionChange = useCallback((region: string) => {
    setSelectedRegion(region);
  }, []);

  const onHiringBudgetChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setHiringBudget(event.target.value as HiringBudget);
    },
    [],
  );

  const onChangeCurrency = useCallback(
    (currency: string) => {
      const selectedCurrency = currencies?.find(
        (c) => c.value === currency,
      )?.label;
      setEmployerBillingCurrency(selectedCurrency);
      onCurrencyChangeRef.current?.(selectedCurrency || '');
    },
    [currencies],
  );

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
            onChange: onHiringBudgetChange,
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
    onHiringBudgetChange,
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

  const schema = useMemo(
    () =>
      buildCostCalculatorSchema({
        countries,
        currencies,
        regions,
        employerBillingCurrency: employerBillingCurrency || 'USD',
        includeEstimationTitle: estimationOptions.includeEstimationTitle,
      }),
    [
      countries,
      currencies,
      regions,
      employerBillingCurrency,
      estimationOptions.includeEstimationTitle,
    ],
  );

  const {
    form: staticForm,
    handleValidation: handleStaticValidation,
    parseFormValues: parseStaticFormValues,
  } = useHeadlessForm({
    schema,
    options: {
      jsfModify: {
        fields: {
          ...options?.jsfModify?.fields,
          ...customFields.fields,
          country: withPresentation(options?.jsfModify?.fields?.country, {
            onChange: onCountryChange,
          }),
          region: withPresentation(options?.jsfModify?.fields?.region, {
            onChange: onRegionChange,
          }),
          currency: withPresentation(options?.jsfModify?.fields?.currency, {
            onChange: onChangeCurrency,
          }),
        },
      },
    },
    strategy: 'buildOnce',
  });
  const staticFields = staticForm?.fields ?? [];

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

  const resetForm = () => {
    setSelectedCountry(undefined);
    setSelectedRegion(defaultRegion);
  };

  const allFields = [
    ...staticFields.filter((field) => field.name !== 'management'),
    ...(jsonSchemaRegionFields?.fields || []),
    ...staticFields.filter((field) => field.name === 'management'),
  ];

  const validationSchema = buildValidationSchema({
    regions,
    employerBillingCurrency: employerBillingCurrency || 'USD',
    includeEstimationTitle: estimationOptions.includeEstimationTitle,
  });

  async function handleValidation(values: CostCalculatorEstimationFormValues) {
    options?.onValidation?.(values);
    const staticFieldsResult = await handleStaticValidation(values);
    const parsedValues = await parseJSFToValidate(values, allFields);
    const regionFieldsResult =
      jsonSchemaRegionFields?.handleValidation(parsedValues);

    return {
      formErrors: {
        ...staticFieldsResult?.formErrors,
        ...regionFieldsResult?.formErrors,
      },
    };
  }

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
     * Yup validation schema for the cost calculator form.
     * @deprecated Use `handleValidation`, which validates the form against its JSON Schema. `validationSchema` will be removed in the next major version.
     */
    // oxlint-disable-next-line typescript/no-deprecated
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

      const parsedStaticFields = await parseStaticFormValues(
        jsonSchemaStaticFieldValues,
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
