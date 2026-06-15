import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { useFormFields } from '@/src/context';

export function BackButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  const handleBack = (evt: React.MouseEvent<HTMLButtonElement>) => {
    employeeBag.goToPreviousStep();
    onClick?.(evt);
  };

  return (
    <CustomButton {...props} onClick={handleBack}>
      {children}
    </CustomButton>
  );
}
