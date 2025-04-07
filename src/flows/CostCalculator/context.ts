import { useCostCalculator } from '@/src/flows/CostCalculator/hooks';
import { $TSFixMe } from '@remoteoss/json-schema-form';
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const CostCalculatorContext = createContext<{
  form: UseFormReturn<$TSFixMe> | null;
  formId: string | undefined;
  costCalculatorBag?: ReturnType<typeof useCostCalculator>;
}>({
  form: null,
  formId: undefined,
  costCalculatorBag: undefined,
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
  } as const;
};
