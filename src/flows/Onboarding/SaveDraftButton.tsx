import { useFormFields } from '@/src/context';
import { useOnboardingContext } from './context';
import { ButtonHTMLAttributes } from 'react';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';

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
  const { onboardingBag } = useOnboardingContext();

  const { components } = useFormFields();

  const handleSaveDraft = async () => {
    try {
      const response = await onboardingBag.onSubmit(onboardingBag.fieldValues);

      if (response?.data) {
        onSuccess?.();
      } else if (response?.error) {
        const currentStepName = onboardingBag.stepState.currentStep.name;

        // Get the appropriate fields based on current step
        const currentStepFields =
          onboardingBag.meta?.fields?.[
            currentStepName as keyof typeof onboardingBag.meta.fields
          ];

        const normalizedFieldErrors = normalizeFieldErrors(
          response?.fieldErrors || [],
          currentStepFields,
        );

        onError?.({
          error: response?.error,
          rawError: response?.rawError,
          fieldErrors: normalizedFieldErrors,
        });
      }
    } catch (error) {
      onError?.({
        error: error as Error,
        rawError: error as Record<string, unknown>,
        fieldErrors: [],
      });
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
