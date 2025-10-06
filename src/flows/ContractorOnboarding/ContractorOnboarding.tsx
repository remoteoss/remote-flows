import { ContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import { useId } from 'react';

export const ContractorOnboardingFlow = (
  props: ContractorOnboardingFlowProps,
) => {
  const contractorOnboardingBag = useContractorOnboarding();
  const formId = useId();
  return (
    <ContractorOnboardingContext.Provider
      value={{ contractorOnboardingBag, formId }}
    >
      <div>ContractorOnboarding</div>
    </ContractorOnboardingContext.Provider>
  );
};
