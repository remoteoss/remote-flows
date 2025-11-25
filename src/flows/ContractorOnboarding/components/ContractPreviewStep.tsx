import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { PDFPreview } from '@/src/components/shared/pdf-preview/PdfPreview';
import { ContractorOnboardingForm } from '@/src/flows/ContractorOnboarding/components/ContractorOnboardingForm';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  ContractPreviewFormPayload,
  ContractPreviewResponse,
} from '@/src/flows/ContractorOnboarding/types';

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
      if (response?.error) {
        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          contractorOnboardingBag.meta?.fields?.contract_preview,
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
    contractorOnboardingBag.stepState.values?.contract_preview ||
    contractorOnboardingBag.initialValues.contract_preview;

  return (
    <div className='space-y-4'>
      <PDFPreview
        base64Data={
          contractorOnboardingBag.documentPreviewPdf?.contract_document
            .content as unknown as string
        }
      />
      <ContractorOnboardingForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
