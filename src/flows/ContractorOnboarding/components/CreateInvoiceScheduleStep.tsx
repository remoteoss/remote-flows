import { $TSFixMe, Components } from '@/src/types/remoteFlows';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import { handleStepError } from '@/src/lib/utils';
import { UseFormReturn } from 'react-hook-form';

type CreateInvoiceScheduleStepProps = {
  /**
   * Components to override the default field components used in the form.
   */
  components?: Components;
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: $TSFixMe) => void | Promise<void>;
  /*
   * The function is called when the form submission is successful.
   */
  onSuccess?: (data: $TSFixMe) => void | Promise<void>;
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

export function CreateInvoiceScheduleStep({
  components,
  onSubmit,
  onSuccess,
  onError,
}: CreateInvoiceScheduleStepProps) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const handleSubmit = async (
    payload: $TSFixMe,
    form: UseFormReturn<$TSFixMe>,
  ) => {
    try {
      const parsedValues =
        await contractorOnboardingBag.parseFormValues(payload);
      await onSubmit?.(parsedValues);
      const response = await contractorOnboardingBag.onSubmit(payload);

      if (response?.data) {
        await onSuccess?.(response.data);
        contractorOnboardingBag?.next();
        return;
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.create_invoice_schedule,
        form,
      );
      onError?.(structuredError);
    }
  };

  const initialValues =
    contractorOnboardingBag.stepState.values?.create_invoice_schedule ||
    contractorOnboardingBag.initialValues.create_invoice_schedule;

  return (
    <ContractorOnboardingForm
      components={components}
      defaultValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
