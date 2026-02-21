import type { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { createContext, useContext, MutableRefObject } from 'react';
import { UseFormSetValue } from 'react-hook-form';
export const ContractorOnboardingContext = createContext<{
  formId: string | undefined;
  contractorOnboardingBag: ReturnType<typeof useContractorOnboarding> | null;
  formRef?: {
    setValue: MutableRefObject<
      UseFormSetValue<Record<string, unknown>> | undefined
    >;
  };
}>({
  formId: undefined,
  contractorOnboardingBag: null,
  formRef: undefined,
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
    formRef: context.formRef,
  } as const;
};
