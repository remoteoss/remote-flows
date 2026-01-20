// TODO: Correct types later
import {
  SelectCountryFormPayload,
  SelectCountrySuccess,
} from '@/src/flows/Onboarding/types';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { handleStepError } from '@/src/lib/utils';

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

export function SelectCountryStep({
  onSubmit,
  onSuccess,
  onError,
}: SelectCountryStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();
  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.({ countryCode: payload.country });
      const response = await contractorOnboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as SelectCountrySuccess);
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.select_country,
      );

      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.select_country ||
    contractorOnboardingBag.initialValues.select_country;

  return (
    <ContractorOnboardingForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
