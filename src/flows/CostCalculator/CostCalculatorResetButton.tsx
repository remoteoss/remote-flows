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

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
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
    </CustomButton>
  );
}
