import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';

export function ContractAmendmentBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const {
    contractAmendment: { back, values },
    form,
  } = useContractAmendmentContext();

  return (
    <Button
      {...props}
      onClick={() => {
        form.reset(values);
        back();
      }}
    >
      {children}
    </Button>
  );
}
