import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { useFormFields } from '@/src/context';

export function SubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { formId, adminBag } = usePayrollAdminOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || adminBag.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
