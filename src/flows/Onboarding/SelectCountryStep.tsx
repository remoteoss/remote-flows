import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';
import {
  SelectCountryFormPayload,
  SelectCountrySuccess,
} from '@/src/flows/Onboarding/types';
import { $TSFixMe } from '@remoteoss/json-schema-form';

type SelectCountryStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: SelectCountryFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: SelectCountrySuccess) => void | Promise<void>;
  /*
   * The function is called when an error occurs during form submission.
   */
  onError?: (error: Error) => void;
};

export function SelectCountryStep({
  onSubmit,
  onSuccess,
  onError,
}: SelectCountryStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.(payload);
      const response = await onboardingBag.onSubmit({
        countryCode: payload.country,
      });
      if (response?.data) {
        await onSuccess?.(response?.data as SelectCountrySuccess);
        onboardingBag?.next();
        return;
      }
      if (response?.error) {
        onError?.(response?.error);
      }
    } catch (error: unknown) {
      onError?.(error as Error);
    }
  };

  const initialValues =
    onboardingBag.stepState.values?.select_country ||
    onboardingBag.initialValues.select_country;

  return (
    <OnboardingForm defaultValues={initialValues} onSubmit={handleSubmit} />
  );
}
