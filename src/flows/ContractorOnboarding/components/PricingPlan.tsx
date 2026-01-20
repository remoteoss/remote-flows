import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import {
  PricingPlanFormPayload,
  PricingPlanResponse,
} from '@/src/flows/ContractorOnboarding/types';
import { handleStepError } from '@/src/lib/utils';

type PricingPlanStepProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: PricingPlanFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: PricingPlanResponse) => void | Promise<void>;
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

export function PricingPlanStep({
  components,
  onSubmit,
  onSuccess,
  onError,
}: PricingPlanStepProps) {
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
        contractorOnboardingBag.meta?.fields?.pricing_plan,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.pricing_plan ||
    contractorOnboardingBag.initialValues.pricing_plan;

  return (
    <ContractorOnboardingForm
      components={components}
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
