import { useFormFields } from '@/src/context';
import { useOnboardingContext } from './context';
import { ButtonHTMLAttributes } from 'react';

type SaveDraftButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onError'
> & {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
};

export const SaveDraftButton = ({
  onSuccess,
  onError,
  className,
  children,
  disabled = false,
  ...props
}: SaveDraftButtonProps) => {
  const { onboardingBag } = useOnboardingContext();

  const { components } = useFormFields();

  const handleSaveDraft = async () => {
    try {
      // Get current form values
      const currentValues = onboardingBag.getCurrentFormValues();

      // Submit without moving to next step
      console.log('submitting draft with current values', currentValues);
      const response = await onboardingBag.onSubmit(currentValues);

      if (response?.data) {
        onSuccess?.();
      } else if (response?.error) {
        onError?.(response.error);
      }
    } catch (error) {
      onError?.(error as Error);
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
      type="button"
      onClick={handleSaveDraft}
      disabled={disabled || onboardingBag.isSubmitting}
      className={className}
    >
      {children}
    </button>
  );
};
