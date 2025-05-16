import React from 'react';
import { Components } from '@/src/types/remoteFlows';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { SuccessResponse } from '@/src/client';
import { useForm } from '@/src/components/form/Form';

type BenefitsPayload = Record<string, unknown>;

type BenefitsStepProps = {
  components: Components;
  /**
   * Callback function to be called when the benefits form is submitted.
   * It can be used to perform any additional validation or processing before
   * the onboarding moves to the last step.
   * @param values
   * @returns
   */
  onSubmit?: (values: BenefitsPayload) => Promise<void>;
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
  onSuccess?: (data: SuccessResponse) => void;
};

export function BenefitsStep({ components }: BenefitsStepProps) {
  const { onboardingBag } = useOnboardingContext();

  const handleSubmit = async () => {
    onboardingBag?.next();
  };

  return (
    <OnboardingForm
      defaultValues={{}}
      components={components}
      onSubmit={handleSubmit}
    />
  );
}
