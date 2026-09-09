import { MinimalRegion } from '@/src/client';
import { buildCostCalculatorSchema } from '@/src/flows/CostCalculator/jsonSchema';
import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  UseCostCalculatorOptions,
} from '@/src/flows/CostCalculator/types';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { buildPayload } from './utils';
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
  code: string;
  childRegions: MinimalRegion[];
  hasAdditionalFields: boolean | undefined;
  regionSlug: string;
  currency: string;
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
   * The default region slug (or country code, e.g. 'USA') to preselect a country and a region.
   */
  defaultRegion?: string;
  /**
   * The default currency slug (or currency code, e.g. 'EUR') to preselect a currency.
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
  const [selectedCurrency, setSelectedCurrency] = useState<{
    value: string;
    label: string;
  }>();
  const employerBillingCurrency = selectedCurrency?.label;
  const [resetKey, setResetKey] = useState(0);
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const checkFieldUpdates = useCallback((values: FieldValues) => {
    setFieldValues(values);
  }, []);
  const { data: countries, isLoading: isLoadingCountries } =
    useCostCalculatorCountries({
      includePremiumBenefits: estimationOptions.includePremiumBenefits,
    });
  const { data: currencies, isLoading: isLoadingCurrencies } =
    useCompanyCurrencies();

  const jsonSchemaRegionSlug = selectedRegion || selectedCountry?.value;

  const { data: regionSchema, isLoading: isLoadingRegionFields } =
    useRegionFields(jsonSchemaRegionSlug, {
      includePremiumBenefits: estimationOptions.includePremiumBenefits,
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
    const salaryTitle = getSalaryTitle(
      salaryField,
      fieldValues.hiring_budget as HiringBudget,
    );

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
    fieldValues.hiring_budget,
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

  const hasChildRegions = (selectedCountry?.childRegions?.length ?? 0) > 0;
  const regionOptions = useMemo(
    () =>
      selectedCountry?.childRegions.map((region) => ({
        value: region.slug,
        label: region.name,
      })) ?? [],
    [selectedCountry?.childRegions],
  );

  const mergedSchema = useMemo(
    () =>
      buildCostCalculatorSchema({
        regionSchema,
        countries,
        currencies,
        regions: regionOptions,
        employerBillingCurrency,
        showEstimationTitleField,
        hasChildRegions,
      }),
    [
      regionSchema,
      countries,
      currencies,
      regionOptions,
      employerBillingCurrency,
      showEstimationTitleField,
      hasChildRegions,
    ],
  );

  const schemaForm = createHeadlessForm(mergedSchema, fieldValues, {
    jsfModify: {
      fields: {
        ...options?.jsfModify?.fields,
        ...customFields?.fields,
      },
    },
  });

  useEffect(() => {
    // Initialize selectedCountry from defaultRegion — matches either the region slug
    // or a plain country code (e.g. 'USA'), so consumers can pass either. Also re-runs
    // after a full reset (resetKey changes) since resetForm() clears selectedCountry.
    if (defaultRegion && countries) {
      const defaultCountry = countries.find(
        ({ value, code }) => value === defaultRegion || code === defaultRegion,
      );
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
        if (
          defaultCountry.childRegions.length === 0 &&
          defaultCountry.hasAdditionalFields
        ) {
          setSelectedRegion(defaultCountry.regionSlug);
        } else {
          // Clear selectedRegion if the country doesn't meet the criteria (has child
          // regions or no additional fields), so jsonSchemaRegionSlug falls back to
          // selectedCountry.value (the correct region slug).
          setSelectedRegion(undefined);
        }
      }
    }
  }, [defaultRegion, countries, resetKey]);

  useEffect(() => {
    // Initialize selectedCurrency from defaultCurrency — matches either the currency
    // slug or a plain currency code (e.g. 'EUR').
    if (defaultCurrency && currencies) {
      const defaultCurrencyObj = currencies.find(
        ({ value, label }) =>
          value === defaultCurrency || label === defaultCurrency,
      );
      if (defaultCurrencyObj) {
        setSelectedCurrency(defaultCurrencyObj);
      }
    }
  }, [defaultCurrency, currencies, resetKey]);

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

  function onChangeCurrency(currency: string) {
    const currencyOption = currencies?.find((c) => c.value === currency);
    setSelectedCurrency(currencyOption);
    options?.onCurrencyChange?.(currencyOption?.label || '');
  }

  // `options`/`isVisible`/`required` for country, currency, and region are no longer set
  // here — they're baked into `mergedSchema` itself (via `countries`/`currencies`/`regions`/
  // `hasChildRegions`), since the library recomputes those properties from the schema
  // whenever it re-validates, which silently discarded a post-hoc mutation like this one.
  // `onChange` is a pure UI callback the schema has no way to express, so it's still
  // attached here — gated on the corresponding data having loaded, same as before, so a
  // field's `onChange` isn't "ready" before its `options` actually are.
  const regionField = schemaForm.fields.find(
    (field) => field.name === 'region',
  );
  if (regionField) {
    regionField.onChange = onRegionChange;
  }

  if (currencies) {
    const currencyField = schemaForm.fields.find(
      (field) => field.name === 'currency',
    );
    if (currencyField) {
      currencyField.onChange = onChangeCurrency;
    }
  }

  if (countries) {
    const countryField = schemaForm.fields.find(
      (field) => field.name === 'country',
    );
    if (countryField) {
      countryField.onChange = onCountryChange;
    }
  }

  // `remount` (default true) bumps `resetKey`, which the flow component uses as a React `key`
  // to fully remount the RHF form instance — necessary because `useForm`/`useJSONSchemaForm`
  // only read `defaultValues` once, at mount, so a bare `form.reset()` would otherwise revert
  // to a stale snapshot rather than the freshly-computed defaults. Partial resets (the
  // `resetFields` prop) pass `{ remount: false }` since they must preserve untouched field
  // values, which a remount would discard.
  const resetForm = (options?: { remount?: boolean }) => {
    setSelectedCountry(undefined);
    setSelectedRegion(defaultRegion);
    if (options?.remount !== false) {
      setFieldValues({});
      setResetKey((key) => key + 1);
    }
  };

  const allFields = schemaForm.fields;

  async function handleValidation(values: CostCalculatorEstimationFormValues) {
    options?.onValidation?.(values);
    const parsedValues = await parseJSFToValidate(values, allFields);
    return schemaForm.handleValidation(parsedValues);
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
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: async (
      values: CostCalculatorEstimationFormValues,
    ): Promise<CostCalculatorEstimationSubmitValues> => {
      const { salary_converted, salary_conversion, currency } = values;

      // If the salary has been converted, we take the one the user has inputted
      const salary =
        salary_converted === 'salary_conversion'
          ? salary_conversion
          : values.salary;

      const parsedFields = await parseJSFToValidate(
        { ...values, salary },
        allFields,
      );

      const additionalFields = {
        currency_code: currencies?.find((c) => c.value === currency)?.label,
      };

      return {
        ...parsedFields,
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
     * Bumped by `resetForm()` (unless called with `{ remount: false }`). Used as a React `key`
     * on the component instantiating the RHF form so a full reset remounts it with freshly
     * computed default values instead of reverting to the stale snapshot RHF captured at
     * first mount.
     */
    resetKey,
    /**
     * Current form values, kept in sync via `checkFieldUpdates`. Passed to `JSONSchemaFormFields`
     * so field-level dynamic properties (visibility, computed values) can react to live input.
     */
    fieldValues,
    /**
     * Called on every form value change (wired into `useJSONSchemaForm`'s `watch` subscription).
     * Keeps `fieldValues` in sync so the schema form's conditionals re-evaluate against current
     * input.
     */
    checkFieldUpdates,

    /**
     * Currencies data useful to get the currency if you have a currencySlug
     */
    currencies,

    /**
     * Countries data useful to resolve a country code (e.g. 'USA') or region slug
     * into the value used internally by the `country` field.
     */
    countries,

    /**
     * The country resolved from `defaultRegion` (or picked via the `country` field's
     * `onChange`) — its `value` is the actual slug the `country` field expects, already
     * resolved whether the input was a plain code (e.g. 'USA') or a slug.
     */
    selectedCountry,

    /**
     * The currency resolved from `defaultCurrency` (or picked via the `currency` field's
     * `onChange`) — its `value` is the actual slug the `currency` field expects, already
     * resolved whether the input was a plain code (e.g. 'EUR') or a slug.
     */
    selectedCurrency,

    /**
     * Fields metadata
     */
    // WE NEED TO FIX: react-hooks/refs - Cannot access ref value during render
    // oxlint-disable-next-line react-hooks/refs
    meta: {
      // WE NEED TO FIX: react-hooks/refs - Cannot access ref value during render
      // oxlint-disable-next-line react-hooks/refs
      fields: fieldsMetaRef.current?.fields,
      'x-jsf-fieldsets': schemaForm.meta?.['x-jsf-fieldsets'],
    },
  };
};
