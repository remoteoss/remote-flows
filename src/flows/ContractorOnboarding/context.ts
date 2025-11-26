import type { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { createContext, useContext } from 'react';

export const ContractorOnboardingContext = createContext<{
  formId: string | undefined;
  contractorOnboardingBag: ReturnType<typeof useContractorOnboarding> | null;
}>({
  formId: undefined,
  contractorOnboardingBag: null,
});

export const useContractorOnboardingContext = () => {
  const context = useContext(ContractorOnboardingContext);
  if (!context.formId || !context.contractorOnboardingBag) {
    throw new Error(
      'useContractorOnboardingContext must be used within a ContractorOnboardingContextProvider',
    );
  }

  return {
    formId: context.formId,
    contractorOnboardingBag: context.contractorOnboardingBag,
  } as const;
};
