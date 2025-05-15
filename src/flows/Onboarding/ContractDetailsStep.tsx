import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';

type ContractDetailsPayload = Record<string, unknown>;

type ContractDetailsStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: ContractDetailsPayload) => void | Promise<void>;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: (error: unknown) => void;
};

export function ContractDetailsStep({
  onSubmit,
  onError,
}: ContractDetailsStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (payload: ContractDetailsPayload) => {
    try {
      await onSubmit?.(
        onboardingBag.parseFormValues(payload) as ContractDetailsPayload,
      );
      const response = await onboardingBag.onSubmit(
        onboardingBag.parseFormValues(payload) as ContractDetailsPayload,
      );
      if (response?.data) {
        onboardingBag?.next();
        return;
      }
      if (response?.error) {
        onError?.(response.error);
      }
    } catch (error) {
      onError?.(error);
    }
  };

  return <OnboardingForm defaultValues={{}} onSubmit={handleSubmit} />;
}
