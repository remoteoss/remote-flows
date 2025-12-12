import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';
import { cn } from '@/src/lib/utils';
import { useFormFields } from '@/src/context';

export function CostCalculatorSubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId } = useCostCalculatorContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      type='submit'
      className={cn(
        'RemoteFlows__CostCalculatorForm__SubmitButton',
        props.className,
      )}
      form={formId}
    >
      {children}
    </CustomButton>
  );
}
