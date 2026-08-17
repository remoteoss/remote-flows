import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { handleStepError } from '@/src/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import {
  InvoiceScheduleFormPayload,
  InvoiceScheduleResponse,
} from '@/src/flows/ContractorOnboarding/types';

type InvoiceScheduleStepProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: InvoiceScheduleFormPayload) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: InvoiceScheduleResponse) => void | Promise<void>;
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

export function InvoiceScheduleStep({
  components,
  onSubmit,
  onSuccess,
  onError,
}: InvoiceScheduleStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (
    payload: $TSFixMe,
    form: UseFormReturn<$TSFixMe>,
  ) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues as InvoiceScheduleFormPayload);
      const response = await contractorOnboardingBag.onSubmit(payload);

      if (response?.data) {
        await onSuccess?.(response.data as InvoiceScheduleResponse);
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.invoice_schedule,
        form,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.invoice_schedule ||
    contractorOnboardingBag.initialValues.invoice_schedule;

  return (
    <ContractorOnboardingForm
      components={components}
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
