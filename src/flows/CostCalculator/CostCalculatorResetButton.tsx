import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';
import { cn } from '@/src/lib/utils';

export function CostCalculatorResetButton(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const { form, formId, costCalculatorBag, defaultValues } =
    useCostCalculatorContext();

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
        form.reset(defaultValues || {});
        props.onClick?.(evt);
      }}
      {...props}
    >
      {props.children}
    </Button>
  );
}
