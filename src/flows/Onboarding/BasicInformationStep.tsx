import React from 'react';
import { useOnboardingContext } from './context';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';

type BasicInformationFormPayload = {
  name: string;
  email: string;
  work_email: string;
  job_title: string;
  tax_servicing_countries: string[];
  tax_job_category: string;
  department: {
    id: string;
    name?: string;
  };
  provisional_start_date: string;
  has_seniority_date: 'yes' | 'no';
  manager: {
    id: string;
  };
  seniority_date: string;
};

type BasicInformationStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: BasicInformationFormPayload) => void | Promise<void>;
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
  const handleSubmit = async (payload: Record<string, unknown>) => {
    try {
      const values = payload as BasicInformationFormPayload;
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
