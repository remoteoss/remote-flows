import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';

export function ContractAmendmentSubmit(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const { formId } = useContractAmendmentContext();

  return (
    <Button {...props} form={formId}>
      {props.children}
    </Button>
  );
}
