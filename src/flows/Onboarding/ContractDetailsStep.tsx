import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';
import { EmploymentResponse } from '@/src/client';
import { ContractDetailsFormPayload } from '@/src/flows/Onboarding/types';
import { $TSFixMe } from '@/src/types/remoteFlows';

type ContractDetailsStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: ContractDetailsFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (response: EmploymentResponse) => void | Promise<void>;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: (error: Error) => void;
};

export function ContractDetailsStep({
  onSubmit,
  onError,
  onSuccess,
}: ContractDetailsStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.(
        onboardingBag.parseFormValues(payload) as ContractDetailsFormPayload,
      );
      const response = await onboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response.data as EmploymentResponse);
        onboardingBag?.next();
        return;
      }
      if (response?.error) {
        onError?.(response.error);
      }
    } catch (error: unknown) {
      onError?.(error as Error);
    }
  };

  return (
    <OnboardingForm
      defaultValues={
        onboardingBag.stepState.values?.contract_details ||
        onboardingBag.initialValues.contract_details
      }
      onSubmit={handleSubmit}
    />
  );
}
