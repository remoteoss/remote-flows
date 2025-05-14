import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';

type ContractDetailsPayload = object;

type BasicInformationStepProps = {
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
}: BasicInformationStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (payload: Record<string, unknown>) => {
    try {
      const values = payload as ContractDetailsPayload;
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
