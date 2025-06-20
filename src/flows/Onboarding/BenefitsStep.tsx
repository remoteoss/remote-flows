import { Components } from '@/src/types/remoteFlows';
import { OnboardingForm } from '@/src/flows/Onboarding/OnboardingForm';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { SuccessResponse } from '@/src/client';
import { getInitialValues } from '@/src/components/form/utils';
import { BenefitsFormPayload } from '@/src/flows/Onboarding/types';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';

type BenefitsStepProps = {
  components?: Components;
  /**
   * Callback function to be called when the benefits form is submitted.
   * It can be used to perform any additional validation or processing before
   * the onboarding moves to the last step.
   * @param values
   * @returns
   */
  onSubmit?: (values: BenefitsFormPayload) => void | Promise<void>;
  /**
   * Callback function to be called when the submitting benefits form fails.
   * @param error
   * @returns
   */
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError?: Error;
    fieldErrors?: NormalizedFieldError[];
  }) => void;
  /**
   * Callback function to be called when benefits form is successfully submitted.
   * This function is called after the submitting benefits form is submitted.
   * @param data
   * @returns
   */
  onSuccess?: (data: SuccessResponse) => void | Promise<void>;
};

export function BenefitsStep({
  components,
  onSubmit,
  onError,
  onSuccess,
}: BenefitsStepProps) {
  const { onboardingBag } = useOnboardingContext();
  const fields = onboardingBag.fields ?? [];
  const initialValues = getInitialValues(
    fields,
    onboardingBag.initialValues.benefits,
  );

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.(payload as BenefitsFormPayload);
      const response = await onboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response.data as SuccessResponse);
        onboardingBag?.next();
        return;
      }
      if (response?.error) {
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          onboardingBag.meta?.fields?.benefits,
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
        rawError: error as Error,
        fieldErrors: [],
      });
    }
  };

  return (
    <OnboardingForm
      defaultValues={initialValues}
      components={components}
      onSubmit={handleSubmit}
    />
  );
}
