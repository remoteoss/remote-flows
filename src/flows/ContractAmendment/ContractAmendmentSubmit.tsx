import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';
import { useFormFields } from '@/src/context';

export function ContractAmendmentSubmit({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId } = useContractAmendmentContext();
  const { components } = useFormFields();

  return (
    <components.button {...props} form={formId}>
      {children}
    </components.button>
  );
}
