import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  normalizeFieldErrors,
  NormalizedFieldError,
} from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import {
  ContractorOnboardingContractDetailsFormPayload,
  ContractorOnboardingContractDetailsResponse,
} from '@/src/flows/ContractorOnboarding/types';

type ContractDetailsStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (
    payload: ContractorOnboardingContractDetailsFormPayload,
  ) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (
    data: ContractorOnboardingContractDetailsResponse,
  ) => void | Promise<void>;
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
  onSuccess,
  onError,
}: ContractDetailsStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      await onSubmit?.(
        contractorOnboardingBag.parseFormValues(payload) as $TSFixMe, // TODO: add type
      );
      const response = await contractorOnboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as $TSFixMe); // TODO: add type
        contractorOnboardingBag?.next();
        return;
      }
      if (response?.error) {
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          contractorOnboardingBag.meta?.fields?.contract_details,
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
    contractorOnboardingBag.stepState.values?.contract_details ||
    contractorOnboardingBag.initialValues.contract_details;

  return (
    <ContractorOnboardingForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
