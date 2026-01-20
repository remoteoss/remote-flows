import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  ContractPreviewFormPayload,
  ContractPreviewResponse,
} from '@/src/flows/ContractorOnboarding/types';
import { handleStepError } from '@/src/lib/utils';

type ContractPreviewStepProps = {
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: ContractPreviewFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: ContractPreviewResponse) => void | Promise<void>;
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

export function ContractPreviewStep({
  onSubmit,
  onSuccess,
  onError,
}: ContractPreviewStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as $TSFixMe);
      const response = await contractorOnboardingBag.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as $TSFixMe); // TODO: add type
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.contract_preview,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.contract_preview ||
    contractorOnboardingBag.initialValues.contract_preview;

  return (
    <div className='space-y-4'>
      <ContractorOnboardingForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
