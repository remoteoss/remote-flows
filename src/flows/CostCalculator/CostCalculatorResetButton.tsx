import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';
import { cn } from '@/src/lib/utils';

export function CostCalculatorResetButton(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const { formId, costCalculatorBag } = useCostCalculatorContext();

  return (
    <Button
      type="reset"
      className={cn(
        'RemoteFlows__CostCalculatorForm__ResetButton',
        props.className,
      )}
      form={formId}
      onClick={(evt) => {
        costCalculatorBag?.resetForm();
        props.onClick?.(evt);
      }}
      {...props}
    >
      {props.children}
    </Button>
  );
}
