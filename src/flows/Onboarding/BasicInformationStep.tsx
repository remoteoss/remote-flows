import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';

type BasicInformationStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: unknown) => void | Promise<void>;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: (error: unknown) => void;
};

export function BasicInformationStep({
  onSubmit,
  onError,
}: BasicInformationStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await onSubmit?.(values);
      const response = await onboardingBag.onSubmit(values);
      if (response.data) {
        onboardingBag?.next();
        return;
      }
      if (response.error) {
        onError?.(response.error);
      }
    } catch (error) {
      onError?.(error);
    }
  };

  return <OnboardingForm onSubmit={handleSubmit} />;
}
