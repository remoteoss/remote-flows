import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';

export function ContractAmendmentBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const {
    contractAmendment: { back },
  } = useContractAmendmentContext();

  return (
    <Button
      {...props}
      onClick={() => {
        back();
      }}
    >
      {children}
    </Button>
  );
}
