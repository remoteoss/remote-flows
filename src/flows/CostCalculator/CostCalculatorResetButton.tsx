import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';
import { cn } from '@/src/lib/utils';
import { useFormFields } from '@/src/context';

export function CostCalculatorResetButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { form, formId, costCalculatorBag } = useCostCalculatorContext();
  const { components } = useFormFields();

  return (
    <components.button
      {...props}
      type='reset'
      className={cn(
        'RemoteFlows__CostCalculatorForm__ResetButton',
        props.className,
      )}
      form={formId}
      onClick={(evt) => {
        costCalculatorBag?.resetForm();
        form.reset();
        props.onClick?.(evt);
      }}
    >
      {children}
    </components.button>
  );
}
