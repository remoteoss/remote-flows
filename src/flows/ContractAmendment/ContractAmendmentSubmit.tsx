import { Button } from '@/src/components/ui/button';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';

export function ContractAmendmentSubmit({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { formId } = useContractAmendmentContext();

  return (
    <Button {...props} form={formId}>
      {children}
    </Button>
  );
}
