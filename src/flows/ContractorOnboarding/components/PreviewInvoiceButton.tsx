import { useFormFields } from '@/src/context';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ButtonHTMLAttributes } from 'react';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { handleStepError } from '@/src/lib/utils';
import { ContractorInvoicePreview } from '@/src/flows/ContractorOnboarding/types';

type PreviewInvoiceButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: (data: ContractorInvoicePreview) => void | Promise<void>;
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

/**
 * Generates a draft (non-persisted) PDF preview of a contractor invoice from
 * the current, unsaved create_invoice_schedule form values.
 */
export const PreviewInvoiceButton = ({
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
  ...props
}: PreviewInvoiceButtonProps) => {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const { components } = useFormFields();

  const handlePreview = async () => {
    try {
      const preview = await contractorOnboardingBag.previewContractorInvoice(
        contractorOnboardingBag.fieldValues,
      );
      if (preview) {
        await onSuccess?.(preview);
      }
    } catch (error: unknown) {
      const structuredError = handleStepError(
        error,
        contractorOnboardingBag.meta?.fields?.create_invoice_schedule,
      );
      onError?.(structuredError);
    }
  };

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      onClick={handlePreview}
      disabled={disabled || contractorOnboardingBag.isPreviewingInvoiceSchedule}
      className={className}
    >
      {children}
    </CustomButton>
  );
};
