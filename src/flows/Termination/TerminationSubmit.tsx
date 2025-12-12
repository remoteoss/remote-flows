import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from './context';
import { useFormFields } from '@/src/context';

export function TerminationSubmit({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId } = useTerminationContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton {...props} form={formId}>
      {children}
    </CustomButton>
  );
}
