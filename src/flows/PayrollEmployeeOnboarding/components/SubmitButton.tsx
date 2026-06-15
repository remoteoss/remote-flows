import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { useFormFields } from '@/src/context';

export function SubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { formId, employeeBag } = usePayrollEmployeeOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || employeeBag.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
