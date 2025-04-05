import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';

export function CostCalculatorSubmitButton(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const { formId } = useCostCalculatorContext();

  return (
    <Button {...props} form={formId}>
      {props.children}
    </Button>
  );
}
