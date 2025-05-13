import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';

type BasicInformationStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: unknown) => void | Promise<void>;
};

export function BasicInformationStep({ onSubmit }: BasicInformationStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (values: unknown) => {
    await onSubmit?.(onboardingBag?.parseFormValues(values) as unknown);
    await onboardingBag.onSubmit(
      onboardingBag?.parseFormValues(values) as Record<string, unknown>,
    );
    onboardingBag?.next();
  };

  return <OnboardingForm onSubmit={handleSubmit} />;
}
