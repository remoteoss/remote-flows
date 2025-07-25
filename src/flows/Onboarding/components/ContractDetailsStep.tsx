import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingForm } from '@/src/flows/Onboarding/components/OnboardingForm';
import { EmploymentResponse } from '@/src/client';
import { ContractDetailsFormPayload } from '@/src/flows/Onboarding/types';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';

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
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
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
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          onboardingBag.meta?.fields?.contract_details,
        );
        onError?.({
          error: response.error,
          rawError: response.rawError,
          fieldErrors: normalizedFieldErrors,
        });
      }
    } catch (error: unknown) {
      onError?.({
        error: error as Error,
        rawError: error as Record<string, unknown>,
        fieldErrors: [],
      });
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
