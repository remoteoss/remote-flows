import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import { CostCalculatorEstimationOptions } from '@/src/flows/CostCalculator/types';
import { $TSFixMe } from '@remoteoss/json-schema-form';
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const CostCalculatorContext = createContext<{
  form: UseFormReturn<$TSFixMe> | null;
  formId: string | undefined;
  estimationOptions?: CostCalculatorEstimationOptions;
  defaultValues?: Partial<{
    countryRegionSlug: string;
    currencySlug: string;
    salary: string;
  }>;
  costCalculatorBag?: ReturnType<typeof useCostCalculator>;
}>({
  form: null,
  formId: undefined,
  costCalculatorBag: undefined,
  estimationOptions: undefined,
  defaultValues: undefined,
});

export const useCostCalculatorContext = () => {
  const context = useContext(CostCalculatorContext);
  if (!context.form) {
    throw new Error(
      'useCostCalculatorContext must be used within a CostCalculatorProvider',
    );
  }

  return {
    form: context.form,
    formId: context.formId,
    costCalculatorBag: context.costCalculatorBag,
    estimationOptions: context.estimationOptions,
    defaultValues: context.defaultValues,
  } as const;
};
