import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingForm } from '@/src/flows/Onboarding/components/OnboardingForm';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';
import { EngagementAgreementDetailsFormPayload } from '@/src/flows/Onboarding/types';
import { SuccessResponse } from '@/src/client';

type EngagementAgreementDetailsStepProps = {
  /**
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (
    payload: EngagementAgreementDetailsFormPayload,
  ) => void | Promise<void>;
  /**
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: SuccessResponse) => void | Promise<void>;
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

export function EngagementAgreementDetailsStep({
  onSubmit,
  onSuccess,
  onError,
}: EngagementAgreementDetailsStepProps) {
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
          onboardingBag.meta?.fields?.engagement_agreement_details,
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

  const initialValues =
    (onboardingBag.stepState.values?.engagement_agreement_details as Record<
      string,
      unknown
    >) || onboardingBag.initialValues.engagement_agreement_details;

  return (
    <OnboardingForm defaultValues={initialValues} onSubmit={handleSubmit} />
  );
}
