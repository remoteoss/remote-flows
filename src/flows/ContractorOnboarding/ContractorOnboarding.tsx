import { OnboardingBack } from '@/src/flows/ContractorOnboarding/components/OnboardingBack';
import { SelectCountryStep } from '@/src/flows/ContractorOnboarding/components/SelectCountryStep';
import { ContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import { BasicInformationStep } from '@/src/flows/ContractorOnboarding/components/BasicInformationStep';
import { OnboardingSubmit } from '@/src/flows/ContractorOnboarding/components/OnboardingSubmit';
import { useId } from 'react';

export const ContractorOnboardingFlow = ({
  render,
  options,
}: ContractorOnboardingFlowProps) => {
  const contractorOnboardingBag = useContractorOnboarding({ options });
  const formId = useId();
  return (
    <ContractorOnboardingContext.Provider
      value={{ contractorOnboardingBag, formId }}
    >
      {render({
        contractorOnboardingBag,
        components: {
          BasicInformationStep: BasicInformationStep,
          SelectCountryStep: SelectCountryStep,
          Back: OnboardingBack,
          Submit: OnboardingSubmit,
        },
      })}
    </ContractorOnboardingContext.Provider>
  );
};
