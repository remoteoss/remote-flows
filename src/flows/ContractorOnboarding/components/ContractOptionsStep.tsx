import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  normalizeFieldErrors,
  NormalizedFieldError,
} from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import {
  ContractOptionsFormPayload,
  ContractOptionsResponse,
} from '@/src/flows/ContractorOnboarding/types';

type ContractOptionsStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: ContractOptionsFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: ContractOptionsResponse) => void | Promise<void>;
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

export function ContractOptionsStep({
  onSubmit,
  onSuccess,
  onError,
}: ContractOptionsStepProps) {
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
          contractorOnboardingBag.meta?.fields?.contract_options,
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
    contractorOnboardingBag.stepState.values?.contract_options ||
    contractorOnboardingBag.initialValues.contract_options;

  return (
    <ContractorOnboardingForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
