import React, { useEffect, useId, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useJSONSchemaForm } from '@/src/components/form/useJSONSchemaForm';
import { CostCalculatorContext } from '@/src/flows/CostCalculator/context';
import {
  CostCalculatorVersion,
  defaultEstimationOptions,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorEstimationOptions,
  CurrencyKey,
  UseCostCalculatorOptions,
} from '@/src/flows/CostCalculator/types';
import { BASE_RATES } from '@/src/flows/CostCalculator/constants';
import { $TSFixMe } from '@/src/types/remoteFlows';

export type CostCalculatorFlowProps = {
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationOptions?: CostCalculatorEstimationOptions;
  /**
   * Default values for the form fields.
   */
  defaultValues?: Partial<
    {
      /**
       * Default value for the country field. Accepts either the country's region slug
       * (as returned by `/v1/cost-calculator/countries`) or a plain country code (e.g. 'USA').
       */
      countryRegionSlug: string;
      /**
       * Default value for the currency field. Accepts either the currency slug (as
       * returned by `/v1/company-currencies`) or a plain currency code (e.g. 'EUR').
       */
      currencySlug: string;
      /**
       * Default value for the salary field.
       */
      salary: string;
      /**
       * Default value for the benefits field.
       */
      benefits: Record<string, string>;
      /**
       * Default value for the hiring budget field
       */
      hiringBudget: string;
      /**
       * Default value for the age field.
       */
      age: number;
      /**
       * Default value for the contract duration type field.
       */
      contractDurationType: 'fixed' | 'indefinite';
      /**
       * Default value for the management fee field.
       */
      management: {
        management_fee: string;
      };
      /**
       * Default value for the region field.
       */
      regionSlug: string;
    } & Record<string, unknown>
  >;
  options?: UseCostCalculatorOptions;
  render: (
    costCalculatorBag: ReturnType<typeof useCostCalculator>,
  ) => React.ReactNode;
  /**
   * Whether to include annual_gross_salary in the estimation payload
   */
  version?: CostCalculatorVersion;
};

const getDefaultManagementFee = (
  baseRates: Record<CurrencyKey, number>,
  currency: CurrencyKey,
  managementFees?: Partial<Record<CurrencyKey, number>>,
) => {
  if (managementFees && managementFees[currency]) {
    return managementFees[currency];
  }
  if (baseRates[currency]) {
    return baseRates[currency] / 100;
  }
  return 0;
};

const getManagementFee = (
  currency: CurrencyKey,
  currencySlug?: string,
  management?: { management_fee: string },
  managementFees?: Partial<Record<CurrencyKey, number>>,
) => {
  if (!currencySlug && !management?.management_fee && currency) {
    return getDefaultManagementFee(BASE_RATES, currency, managementFees);
  }
  if (currencySlug && !management?.management_fee) {
    return '';
  }

  return management?.management_fee;
};

type ResolvedDefaultValues = NonNullable<
  CostCalculatorFlowProps['defaultValues']
>;

type CostCalculatorFlowInnerProps = {
  formId: string;
  formRef: React.MutableRefObject<UseFormReturn<$TSFixMe> | null>;
  currency: CurrencyKey;
  setCurrency: (currency: CurrencyKey) => void;
  defaultValues: ResolvedDefaultValues;
  estimationOptions: CostCalculatorEstimationOptions;
  costCalculatorBag: ReturnType<typeof useCostCalculator>;
  render: CostCalculatorFlowProps['render'];
};

// Owns the RHF form instance. Rendered with a `key` derived from `costCalculatorBag.resetKey`
// (see the outer `CostCalculatorFlow` below) so a full reset remounts this component instead of
// calling `form.reset()` against a stale `defaultValues` snapshot — `useJSONSchemaForm`/RHF only
// ever read `defaultValues` once, at mount.
const CostCalculatorFlowInner = ({
  formId,
  formRef,
  currency,
  setCurrency,
  defaultValues,
  estimationOptions,
  costCalculatorBag,
  render,
}: CostCalculatorFlowInnerProps) => {
  const defaultManagementFee = getManagementFee(
    currency,
    defaultValues.currencySlug,
    defaultValues.management,
    estimationOptions.managementFees,
  );

  const {
    countryRegionSlug,
    currencySlug,
    salary,
    benefits,
    hiringBudget,
    age,
    contractDurationType,
    regionSlug,
    ...formDefaultValues
  } = defaultValues;

  // `useJSONSchemaForm` (via RHF) only reads this once, at mount — recomputing it on later
  // renders of this same mount is harmless but pointless, so this intentionally isn't memoized
  // beyond what a plain render already gives it.
  const rhfDefaultValues = {
    country: countryRegionSlug,
    currency: currencySlug,
    region: regionSlug,
    salary: salary,
    salary_conversion: '',
    salary_converted: undefined,
    hiring_budget: hiringBudget || 'employee_annual_salary',
    age: age,
    contract_duration_type: contractDurationType,
    management: {
      management_fee: defaultManagementFee?.toString() || '',
    },
    benefits: benefits,
    estimation_title: estimationOptions.title,
    ...formDefaultValues,
  };

  const form = useJSONSchemaForm({
    // `costCalculatorBag.handleValidation` is narrower than `useJSONSchemaForm`'s generic
    // `(values: FieldValues) => ...` contract (it returns the flow's own
    // `{ formErrors, yupError }` shape rather than the library's `ValidationResult`) — the same
    // adapter mismatch `$TSFixMe` exists for elsewhere in this codebase.
    handleValidation: costCalculatorBag.handleValidation as $TSFixMe,
    defaultValues: rhfDefaultValues,
    checkFieldUpdates: costCalculatorBag.checkFieldUpdates,
  });

  // Lets the outer component's `onCurrencyChange` (passed into `useCostCalculator` before this
  // form exists) reach this mount's `form.setValue` without lifting the form instance itself.
  formRef.current = form;

  useEffect(() => {
    if (
      costCalculatorBag.selectedCurrency &&
      estimationOptions.includeManagementFee &&
      !defaultValues.management?.management_fee
    ) {
      const currencyCode = costCalculatorBag.selectedCurrency
        .label as CurrencyKey;
      // WE NEED TO FIX: react-hooks/set-state-in-effect - Calling setState synchronously within an effect can trigger cascading renders
      // oxlint-disable-next-line react-hooks/set-state-in-effect
      setCurrency(currencyCode);
      const defaultManagementFee = getDefaultManagementFee(
        BASE_RATES,
        currencyCode,
        estimationOptions.managementFees,
      );
      form.setValue(
        'management.management_fee',
        defaultManagementFee?.toString() || '',
      );
    }
  }, [
    costCalculatorBag.selectedCurrency,
    estimationOptions.includeManagementFee,
    estimationOptions.managementFees,
    defaultValues.management?.management_fee,
    form,
    setCurrency,
  ]);

  // `countryRegionSlug`/`currencySlug` may be a plain code (e.g. 'USA'/'EUR') rather
  // than the actual slug the `country`/`currency` fields' `oneOf` expects — the RHF
  // default set above is the raw value as-is. `costCalculatorBag.selectedCountry`/
  // `selectedCurrency` already resolve either shape against the loaded
  // countries/currencies lists, so once they're available, mirror the resolved slug
  // into the field (a no-op if the raw value was already the correct slug).
  useEffect(() => {
    if (costCalculatorBag.selectedCountry) {
      form.setValue('country', costCalculatorBag.selectedCountry.value);
    }
  }, [costCalculatorBag.selectedCountry, form]);

  useEffect(() => {
    if (costCalculatorBag.selectedCurrency) {
      form.setValue('currency', costCalculatorBag.selectedCurrency.value);
    }
  }, [costCalculatorBag.selectedCurrency, form]);

  return (
    <CostCalculatorContext.Provider
      value={{
        form,
        formId: formId,
        costCalculatorBag,
      }}
    >
      {render(costCalculatorBag)}
    </CostCalculatorContext.Provider>
  );
};

export const CostCalculatorFlow = ({
  estimationOptions = defaultEstimationOptions,
  defaultValues = {
    countryRegionSlug: '',
    regionSlug: '',
    currencySlug: '',
    salary: '',
    benefits: {},
    management: {
      management_fee: '',
    },
  },
  options,
  render,
  version = 'standard',
}: CostCalculatorFlowProps) => {
  const formId = useId();
  const [currency, setCurrency] = useState<CurrencyKey>('USD');
  const formRef = useRef<UseFormReturn<$TSFixMe> | null>(null);

  const onCurrencyChange = (currency: string) => {
    setCurrency(currency as CurrencyKey);
    const managementFee = getDefaultManagementFee(
      BASE_RATES,
      currency as CurrencyKey,
      estimationOptions.managementFees,
    );
    if (managementFee) {
      formRef.current?.setValue(
        'management.management_fee',
        managementFee.toString(),
      );
    }
  };

  const costCalculatorBag = useCostCalculator({
    defaultRegion: defaultValues.countryRegionSlug,
    defaultCurrency: defaultValues.currencySlug,
    defaultSalary: defaultValues.salary,
    estimationOptions,
    version,
    options: {
      ...options,
      onCurrencyChange: onCurrencyChange,
    },
  });

  return (
    <CostCalculatorFlowInner
      key={`cost-calculator-${costCalculatorBag.resetKey}`}
      formId={formId}
      formRef={formRef}
      currency={currency}
      setCurrency={setCurrency}
      defaultValues={defaultValues}
      estimationOptions={estimationOptions}
      costCalculatorBag={costCalculatorBag}
      render={render}
    />
  );
};
