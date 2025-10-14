import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  normalizeFieldErrors,
  NormalizedFieldError,
} from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import {
  PricingPlanFormPayload,
  PricingPlanResponse,
} from '@/src/flows/ContractorOnboarding/types';

type PricingPlanStepProps = {
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
  onSubmit,
  onSuccess,
  onError,
}: PricingPlanStepProps) {
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
          contractorOnboardingBag.meta?.fields?.pricing_plan,
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
    contractorOnboardingBag.stepState.values?.pricing_plan ||
    contractorOnboardingBag.initialValues.pricing_plan;

  return (
    <ContractorOnboardingForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
