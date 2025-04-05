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
}>({
  form: null,
  formId: undefined,
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
  } as const;
};
