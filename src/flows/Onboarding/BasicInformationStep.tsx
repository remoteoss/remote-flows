import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';
import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';
import { EmploymentCreationResponse } from '@/src/client';

type BasicInformationStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: BasicInformationFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: EmploymentCreationResponse) => void;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: (error: unknown) => void;
};

export function BasicInformationStep({
  onSubmit,
  onSuccess,
  onError,
}: BasicInformationStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (payload: BasicInformationFormPayload) => {
    try {
      await onSubmit?.(
        onboardingBag.parseFormValues(payload) as BasicInformationFormPayload,
      );
      const response = await onboardingBag.onSubmit(payload);
      if (response?.data?.data) {
        onSuccess?.(response?.data?.data as EmploymentCreationResponse);
        onboardingBag?.next();
        return;
      }
      if (response?.error) {
        onError?.(response?.error);
      }
    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <OnboardingForm
      defaultValues={
        onboardingBag.stepState.values?.basic_information ||
        onboardingBag.initialValues.basic_information
      }
      onSubmit={handleSubmit}
    />
  );
}
