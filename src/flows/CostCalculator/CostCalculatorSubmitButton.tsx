import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';
import { cn } from '@/src/lib/utils';

export function CostCalculatorSubmitButton(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const { formId } = useCostCalculatorContext();

  return (
    <Button
      type="submit"
      className={cn(
        'RemoteFlows__CostCalculatorForm__SubmitButton',
        props.className,
      )}
      form={formId}
      {...props}
    >
      {props.children}
    </Button>
  );
}
