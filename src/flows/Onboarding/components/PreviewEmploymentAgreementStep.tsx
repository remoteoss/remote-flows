import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingForm } from '@/src/flows/Onboarding/components/OnboardingForm';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';
import { SuccessResponse } from '@/src/client';

type PreviewEmploymentAgreementStepProps = {
  /**
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: $TSFixMe) => void | Promise<void>;
  /**
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: $TSFixMe) => void | Promise<void>;
  /**
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

export function PreviewEmploymentAgreementStep({
  onSubmit,
  onSuccess,
  onError,
}: PreviewEmploymentAgreementStepProps) {
  const { onboardingBag } = useOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues = await onboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as $TSFixMe);
      const response = await onboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as SuccessResponse);
        onboardingBag?.next();
        return;
      }

      if (response?.error) {
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          {},
        );

        onError?.({
          error: response?.error,
          rawError: response?.rawError,
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

  // this step in theory shouldn't be a form, not sure yet...

  return <OnboardingForm defaultValues={{}} onSubmit={handleSubmit} />;
}
