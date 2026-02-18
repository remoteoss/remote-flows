import { UseFormSetValue } from 'react-hook-form';
import { useId, useRef, useMemo } from 'react';
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
import { EligibilityQuestionnaireStep } from '@/src/flows/ContractorOnboarding/components/EligibilityQuestionnaireStep';
import { ChooseAlternativePlanStep } from '@/src/flows/ContractorOnboarding/components/ChooseAlternativePlanStep';

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
  // Store form's setValue method in ref to allow sibling components
  // to update form state directly (e.g., ContractReviewButton setting review_completed)
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
          EligibilityQuestionnaireStep: EligibilityQuestionnaireStep,
          ChooseAlternativePlanStep: ChooseAlternativePlanStep,
          ContractDetailsStep: ContractDetailsStep,
          ContractPreviewStep: ContractPreviewStep,
          OnboardingInvite: OnboardingInvite,
          ContractReviewButton: ContractReviewButton,
        },
      })}
    </ContractorOnboardingContext.Provider>
  );
};
