import type { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';
import { createContext, useContext } from 'react';

export const PayrollAdminOnboardingContext = createContext<{
  formId: string | undefined;
  adminBag: ReturnType<typeof usePayrollAdminOnboarding> | null;
}>({
  formId: undefined,
  adminBag: null,
});

export const usePayrollAdminOnboardingContext = () => {
  const context = useContext(PayrollAdminOnboardingContext);
  if (!context.formId || !context.adminBag) {
    throw new Error(
      'usePayrollAdminOnboardingContext must be used within a PayrollAdminOnboardingFlow',
    );
  }
  return {
    formId: context.formId,
    adminBag: context.adminBag,
  } as const;
};
