import React, { useId } from 'react';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { BasicInformationStep } from '@/src/flows/Onboarding/BasicInformationStep';
import { OnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingSubmit } from '@/src/flows/Onboarding/OnboardingSubmit';
import { OnboardingBack } from '@/src/flows/Onboarding/OnboardingBack';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
<<<<<<< HEAD
import { ContractDetailsStep } from '@/src/flows/Onboarding/ContractDetailsStep';
=======
>>>>>>> onboarding-flow

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
   * @see {@link OnboardingSubmit}
   * @see {@link OnboardingBack}
   * @see {@link ContractDetailsStep}
   */
  components: {
    SubmitButton: typeof OnboardingSubmit;
    BackButton: typeof OnboardingBack;
    BasicInformationStep: typeof BasicInformationStep;
    ContractDetailsStep: typeof ContractDetailsStep;
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
  countryCode,
  type = 'employee',
  render,
  options,
}: OnboardingFlowProps) => {
  const formId = useId();
  const onboardingBag = useOnboarding({
    employmentId,
    countryCode,
    type,
    options,
  });

  return (
    <OnboardingContext.Provider
      value={{
        formId: formId,
        onboardingBag,
      }}
    >
      {render({
        onboardingBag,
        components: {
          BasicInformationStep: BasicInformationStep,
          SubmitButton: OnboardingSubmit,
          BackButton: OnboardingBack,
          ContractDetailsStep: ContractDetailsStep,
        },
      })}
    </OnboardingContext.Provider>
  );
};
