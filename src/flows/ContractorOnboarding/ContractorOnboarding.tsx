import { useId } from 'react';
import { OnboardingBack } from '@/src/flows/ContractorOnboarding/components/OnboardingBack';
import { SelectCountryStep } from '@/src/flows/ContractorOnboarding/components/SelectCountryStep';
import { ContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import { BasicInformationStep } from '@/src/flows/ContractorOnboarding/components/BasicInformationStep';
import { OnboardingSubmit } from '@/src/flows/ContractorOnboarding/components/OnboardingSubmit';
import { PricingPlanStep } from '@/src/flows/ContractorOnboarding/components/PricingPlan';
import { ContractDetailsStep } from '@/src/flows/ContractorOnboarding/components/ContractDetailsStep';
import { ContractPreviewStep } from '@/src/flows/ContractorOnboarding/components/ContractPreviewStep';
import { OnboardingInvite } from '@/src/flows/ContractorOnboarding/components/OnboardingInvite';

export const ContractorOnboardingFlow = ({
  render,
  employmentId,
  externalId,
  countryCode,
  skipSteps,
  initialValues,
  options,
}: ContractorOnboardingFlowProps) => {
  const contractorOnboardingBag = useContractorOnboarding({
    options,
    employmentId,
    externalId,
    countryCode,
    skipSteps,
    initialValues,
  });
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
          BackButton: OnboardingBack,
          SubmitButton: OnboardingSubmit,
          PricingPlanStep: PricingPlanStep,
          ContractDetailsStep: ContractDetailsStep,
          ContractPreviewStep: ContractPreviewStep,
          OnboardingInvite: OnboardingInvite,
        },
      })}
    </ContractorOnboardingContext.Provider>
  );
};
