import React, { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
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

export type CostCalculatorFlowProps = {
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationOptions?: CostCalculatorEstimationOptions;
  /**
   * Default values for the form fields.
   */
  defaultValues?: Partial<{
    /**
     * Default value for the country field.
     */
    countryRegionSlug: string;
    /**
     * Default value for the currency field.
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
  }>;
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

export const CostCalculatorFlow = ({
  estimationOptions = defaultEstimationOptions,
  defaultValues = {
    countryRegionSlug: '',
    currencySlug: '',
    salary: '',
    benefits: {},
  },
  options,
  render,
  version = 'standard',
}: CostCalculatorFlowProps) => {
  const formId = useId();
  const [currency, setCurrency] = useState<CurrencyKey>('USD');
  const onCurrencyChange = (currency: string) => {
    setCurrency(currency as CurrencyKey);
    const managementFee = getDefaultManagementFee(
      BASE_RATES,
      currency as CurrencyKey,
      estimationOptions.managementFees,
    );
    if (managementFee) {
      form.setValue('management.management_fee', managementFee);
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
  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    costCalculatorBag.handleValidation,
  );

  const defaultManagementFee = defaultValues.currencySlug
    ? ''
    : getDefaultManagementFee(
        BASE_RATES,
        currency,
        estimationOptions.managementFees,
      );

  const form = useForm({
    resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
      salary_conversion: '',
      salary_converted: '',
      management: {
        management_fee: defaultManagementFee,
      },
      benefits: defaultValues?.benefits,
    },
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (
      defaultValues.currencySlug &&
      costCalculatorBag.currencies &&
      estimationOptions.includeManagementFee
    ) {
      const currencyData = costCalculatorBag.currencies.find(
        (currency) => currency.value === defaultValues.currencySlug,
      );
      const currencyCode = currencyData?.label;
      if (currencyCode) {
        setCurrency(currencyCode as CurrencyKey);
        const defaultManagementFee = getDefaultManagementFee(
          BASE_RATES,
          currencyCode as CurrencyKey,
          estimationOptions.managementFees,
        );
        form.setValue('management.management_fee', defaultManagementFee);
      }
    }
  }, [
    defaultValues.currencySlug,
    costCalculatorBag.currencies,
    estimationOptions.includeManagementFee,
    estimationOptions.managementFees,
    form,
  ]);

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
