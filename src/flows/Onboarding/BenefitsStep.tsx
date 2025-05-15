import React from 'react';
import { FieldValues } from 'react-hook-form';
import { Components } from '@/src/types/remoteFlows';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';

type BenefitsStepProps = {
  components: Components;
  /**
   * Callback function to be called when the benefits form is submitted.
   * It can be used to perform any additional validation or processing before
   * the onboarding moves to the last step.
   * @param values
   * @returns
   */
  onSubmit?: (values: FieldValues) => Promise<void>;
  /**
   * Callback function to be called when the submitting benefits form fails.
   * @param error
   * @returns
   */
  onError?: (error: unknown) => void;
  /**
   * Callback function to be called when benefits form is successfully submitted.
   * This function is called after the submitting benefits form is submitted.
   * @param data
   * @returns
   */
  onSuccess?: (data: unknown) => void;
};

export function BenefitsStep({ components }: BenefitsStepProps) {
  const handleSubmit = (payload: FieldValues) => {
    console.log('Benefits form submitted with values:', payload);
  };
  return (
    <OnboardingForm
      fieldsKey="benefits"
      defaultValues={{}}
      components={components}
      onSubmit={handleSubmit}
    />
  );
}
