import { useFormFields } from '@/src/context';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { ButtonHTMLAttributes } from 'react';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { $TSFixMe } from '@/src/types/remoteFlows';

type SaveDraftButtonProps = Omit<
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

export const SaveDraftButton = ({
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
  ...props
}: SaveDraftButtonProps) => {
  const { onboardingBag, formId } = useOnboardingContext();

  const { components } = useFormFields();

  const handleSaveDraft = async () => {
    const form = document.getElementById(formId);
    if (form) {
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      (submitEvent as $TSFixMe).isDraftSubmission = true;
      (submitEvent as $TSFixMe).draftCallbacks = { onSuccess, onError };
      form.dispatchEvent(submitEvent);
    }
  };

  const CustomButton = components?.button;
  if (CustomButton) {
    return (
      <CustomButton
        {...props}
        onClick={handleSaveDraft}
        disabled={disabled || onboardingBag.isSubmitting}
        className={className}
      >
        {children}
      </CustomButton>
    );
  }

  return (
    <button
      type='button'
      onClick={handleSaveDraft}
      disabled={disabled || onboardingBag.isSubmitting}
      className={className}
    >
      {children}
    </button>
  );
};
