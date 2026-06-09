import type { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';
import { createContext, useContext } from 'react';

export const PayrollEmployeeOnboardingContext = createContext<{
  formId: string | undefined;
  employeeBag: ReturnType<typeof usePayrollEmployeeOnboarding> | null;
}>({
  formId: undefined,
  employeeBag: null,
});

export const usePayrollEmployeeOnboardingContext = () => {
  const context = useContext(PayrollEmployeeOnboardingContext);
  if (!context.formId || !context.employeeBag) {
    throw new Error(
      'usePayrollEmployeeOnboardingContext must be used within a PayrollEmployeeOnboardingFlow',
    );
  }
  return context as {
    formId: string;
    employeeBag: ReturnType<typeof usePayrollEmployeeOnboarding>;
  };
};
