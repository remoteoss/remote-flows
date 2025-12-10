import { Button } from '@/src/components/ui/button';
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

  const CustomButton = components?.button || Button;
  return (
    <CustomButton {...props} form={formId}>
      {children}
    </CustomButton>
  );
}
