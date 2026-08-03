import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { OnboardingForm } from '@/src/flows/Onboarding/components/OnboardingForm';
import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';
import { EmploymentCreationResponse } from '@/src/client';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  normalizeFieldErrors,
  NormalizedFieldError,
} from '@/src/lib/mutations';

type BasicInformationStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: BasicInformationFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: EmploymentCreationResponse) => void | Promise<void>;
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

export function BasicInformationStep({
  onSubmit,
  onSuccess,
  onError,
}: BasicInformationStepProps) {
  const { onboardingBag } = useOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues = await onboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as BasicInformationFormPayload);
      const response = await onboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as EmploymentCreationResponse);
        onboardingBag?.next();
        return;
      }
      if (response?.error) {
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          onboardingBag.meta?.fields?.basic_information,
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
    onboardingBag.stepState.values?.basic_information ||
    onboardingBag.initialValues.basic_information;

  return (
    <OnboardingForm defaultValues={initialValues} onSubmit={handleSubmit} />
  );
}
