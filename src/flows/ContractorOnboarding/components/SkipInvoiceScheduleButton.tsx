import { useFormFields } from '@/src/context';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { ButtonHTMLAttributes } from 'react';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { handleStepError } from '@/src/lib/utils';

type SkipInvoiceScheduleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: () => void | Promise<void>;
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
 * Cancels the existing scheduled invoice (marks it as `deleted`) and returns
 * the wizard to the invoice_schedule step. Only meaningful once an existing
 * schedule has been loaded on the create_invoice_schedule step.
 */
export const SkipInvoiceScheduleButton = ({
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
  ...props
}: SkipInvoiceScheduleButtonProps) => {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const { components } = useFormFields();

  const handleSkip = async () => {
    try {
      await contractorOnboardingBag.skipInvoiceSchedule();
      await onSuccess?.();
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
      onClick={handleSkip}
      disabled={
        disabled ||
        !contractorOnboardingBag.existingInvoiceSchedule?.id ||
        contractorOnboardingBag.isSkippingInvoiceSchedule
      }
      className={className}
    >
      {children}
    </CustomButton>
  );
};
