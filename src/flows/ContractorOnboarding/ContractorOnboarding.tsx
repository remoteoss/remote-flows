import { useId, useMemo, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
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
import { ContractReviewButton } from '@/src/flows/ContractorOnboarding/components/ContractReviewButton';

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
  const setValueRef = useRef<
    UseFormSetValue<Record<string, unknown>> | undefined
  >(undefined);
  const formRef = useMemo(() => ({ setValue: setValueRef }), []);

  return (
    <ContractorOnboardingContext.Provider
      value={{ contractorOnboardingBag, formId, formRef }}
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
          ContractReviewButton: ContractReviewButton,
        },
      })}
    </ContractorOnboardingContext.Provider>
  );
};
