import { useId, useState } from 'react';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { BasicInformationStep } from '@/src/flows/Onboarding/components/BasicInformationStep';
import { OnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingSubmit } from '@/src/flows/Onboarding/components/OnboardingSubmit';
import { OnboardingBack } from '@/src/flows/Onboarding/components/OnboardingBack';
import { OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import { OnboardingInvite } from '@/src/flows/Onboarding/components/OnboardingInvite';
import { ContractDetailsStep } from '@/src/flows/Onboarding/components/ContractDetailsStep';
import { BenefitsStep } from '@/src/flows/Onboarding/components/BenefitsStep';
import { SelectCountryStep } from '@/src/flows/Onboarding/components/SelectCountryStep';
import { ReviewStep } from '@/src/flows/Onboarding/components/ReviewStep';
import { SaveDraftButton } from '@/src/flows/Onboarding/components/SaveDraftButton';

export const OnboardingFlow = ({
  employmentId,
  companyId,
  countryCode,
  type = 'employee',
  externalId,
  skipSteps,
  initialValues,
  render,
  options,
}: OnboardingFlowProps) => {
  const formId = useId();
  const onboardingBag = useOnboarding({
    companyId,
    countryCode,
    employmentId,
    type,
    options,
    skipSteps,
    externalId,
    initialValues,
  });

  const [creditScore, setCreditScore] = useState<{
    showReserveInvoice: boolean;
    showInviteSuccessful: boolean;
  }>({
    showReserveInvoice: false,
    showInviteSuccessful: false,
  });

  return (
    <OnboardingContext.Provider
      value={{
        formId: formId,
        onboardingBag,
        creditScore,
        setCreditScore: setCreditScore,
      }}
    >
      {render({
        onboardingBag,
        components: {
          BasicInformationStep: BasicInformationStep,
          ContractDetailsStep: ContractDetailsStep,
          BenefitsStep: BenefitsStep,
          SubmitButton: OnboardingSubmit,
          SaveDraftButton: SaveDraftButton,
          BackButton: OnboardingBack,
          OnboardingInvite: OnboardingInvite,
          SelectCountryStep: SelectCountryStep,
          ReviewStep: ReviewStep,
        },
      })}
    </OnboardingContext.Provider>
  );
};
