import React, { useId } from 'react';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { BasicInformationStep } from '@/src/flows/Onboarding/BasicInformationStep';
import { OnboardingContext } from '@/src/flows/Onboarding/context';

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
   */
  components: {
    BasicInformationStep: typeof BasicInformationStep;
  };
};

type OnboardingFlowProps = {
  employmentId?: string;
  render: ({
    onboardingBag,
    components,
  }: OnboardingRenderProps) => React.ReactNode;
  options?: {
    jsfModify?: JSFModify;
  };
};

export const OnboardingFlow = ({
  employmentId,
  render,
  options,
}: OnboardingFlowProps) => {
  const formId = useId();
  const onboardingBag = useOnboarding({ employmentId, options });

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
        },
      })}
    </OnboardingContext.Provider>
  );
};
