import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { useFormFields } from '@/src/context';

export function BackButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  const handleBack = (evt: React.MouseEvent<HTMLButtonElement>) => {
    adminBag.back();
    onClick?.(evt);
  };

  return (
    <CustomButton {...props} onClick={handleBack}>
      {children}
    </CustomButton>
  );
}
