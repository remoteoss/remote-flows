import React, { useId, useState } from 'react';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { BasicInformationStep } from '@/src/flows/Onboarding/components/BasicInformationStep';
import { OnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingSubmit } from '@/src/flows/Onboarding/components/OnboardingSubmit';
import { OnboardingBack } from '@/src/flows/Onboarding/components/OnboardingBack';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
import { OnboardingInvite } from '@/src/flows/Onboarding/components/OnboardingInvite';
import { ContractDetailsStep } from '@/src/flows/Onboarding/components/ContractDetailsStep';
import { BenefitsStep } from '@/src/flows/Onboarding/components/BenefitsStep';
import { SelectCountryStep } from '@/src/flows/Onboarding/components/SelectCountryStep';
import { ReviewStep } from '@/src/flows/Onboarding/components/ReviewStep';
import { SaveDraftButton } from '@/src/flows/Onboarding/components/SaveDraftButton';

export type OnboardingRenderProps = {
  /**
   * The onboarding bag returned by the useOnboarding hook.
   * This bag contains all the methods and properties needed to handle the onboarding flow.
   * @see {@link useOnboarding}
   */
  onboardingBag: ReturnType<typeof useOnboarding>;
  /**
   * The components used in the onboarding flow.
   * This includes different steps, submit button, back button.
   * @see {@link BasicInformationStep}
   * @see {@link ContractDetailsStep}
   * @see {@link OnboardingSubmit}
   * @see {@link OnboardingBack}
   * @see {@link OnboardingInvite}
   * @see {@link BenefitsStep}
   * @see {@link OnboardingCreateReserve}
   * @see {@link InvitationSection}
   * @see {@link SelectCountryStep}
   * @see {@link ReviewStep}
   * @see {@link SaveDraftButton}
   */
  components: {
    SubmitButton: typeof OnboardingSubmit;
    BackButton: typeof OnboardingBack;
    BasicInformationStep: typeof BasicInformationStep;
    OnboardingInvite: typeof OnboardingInvite;
    ContractDetailsStep: typeof ContractDetailsStep;
    BenefitsStep: typeof BenefitsStep;
    SelectCountryStep: typeof SelectCountryStep;
    ReviewStep: typeof ReviewStep;
    SaveDraftButton: typeof SaveDraftButton;
  };
};

type OnboardingFlowProps = OnboardingFlowParams & {
  render: ({
    onboardingBag,
    components,
  }: OnboardingRenderProps) => React.ReactNode;
};

export const OnboardingFlow = ({
  employmentId,
  companyId,
  countryCode,
  type = 'employee',
  skipSteps,
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
