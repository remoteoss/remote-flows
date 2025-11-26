import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';
import { EmploymentCreationResponse } from '@/src/client';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  normalizeFieldErrors,
  NormalizedFieldError,
} from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';

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
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (payload: $TSFixMe) => {
    try {
      const parsedValues =
        await contractorOnboardingBag?.parseFormValues(payload);
      await onSubmit?.(parsedValues as BasicInformationFormPayload);
      const response = await contractorOnboardingBag?.onSubmit(payload);
      if (response?.data) {
        await onSuccess?.(response?.data as EmploymentCreationResponse);
        contractorOnboardingBag?.next();
        return;
      }
      if (response?.error) {
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          contractorOnboardingBag?.meta?.fields?.basic_information,
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
    contractorOnboardingBag?.stepState.values?.basic_information ||
    contractorOnboardingBag?.initialValues.basic_information;

  return (
    <ContractorOnboardingForm
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
