import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { handleStepError } from '@/src/lib/utils';
import { UseFormReturn } from 'react-hook-form';

type ContractOriginStepProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: { contract_origin: string }) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: { contractOrigin: string }) => void | Promise<void>;
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

export function ContractOriginStep({
  components,
  onSubmit,
  onSuccess,
  onError,
}: ContractOriginStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (
    payload: $TSFixMe,
    form: UseFormReturn<$TSFixMe>,
  ) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as { contract_origin: string });
      const response = await contractorOnboardingBag.onSubmit(payload);

      if (response?.data) {
        await onSuccess?.(response.data as { contractOrigin: string });
        if (!(response as $TSFixMe)?._skipNextStep) {
          contractorOnboardingBag?.next();
        }
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.contract_origin,
        form,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.contract_origin ||
    contractorOnboardingBag.initialValues.contract_origin;

  return (
    <ContractorOnboardingForm
      components={components}
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
