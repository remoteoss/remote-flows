import { ContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import { BasicInformationStep } from '@/src/flows/Onboarding/components/BasicInformationStep';
import { useId } from 'react';

export const ContractorOnboardingFlow = ({
  render,
}: ContractorOnboardingFlowProps) => {
  const contractorOnboardingBag = useContractorOnboarding();
  const formId = useId();
  return (
    <ContractorOnboardingContext.Provider
      value={{ contractorOnboardingBag, formId }}
    >
      {render({
        contractorOnboardingBag,
        components: {
          BasicInformationStep: BasicInformationStep,
        },
      })}
    </ContractorOnboardingContext.Provider>
  );
};
