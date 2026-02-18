import { $TSFixMe } from '@/src/types/remoteFlows';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { handleStepError } from '@/src/lib/utils';

type ChooseAlternativePlanStepProps = {
  onSubmit?: (payload: { subscription: string }) => void | Promise<void>;
  onSuccess?: (data: { subscription: string }) => void | Promise<void>;
  onError?: ({
    error,
    rawError,
    fieldErrors,
  }: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: NormalizedFieldError[];
  }) => void;
  components?: $TSFixMe;
};

export function ChooseAlternativePlanStep({
  onSubmit,
  onSuccess,
  onError,
  components,
}: ChooseAlternativePlanStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues);
      const response = await contractorOnboardingBag.onSubmit(payload);

      if (response?.data) {
        await onSuccess?.(response?.data);
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.choose_alternative_plan,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.choose_alternative_plan;

  return (
    <ContractorOnboardingForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
      components={components}
    />
  );
}
