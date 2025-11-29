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

  return (
    <components.button {...props} form={formId}>
      {children}
    </components.button>
  );
}
