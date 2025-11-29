import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCostCalculatorContext } from './context';
import { useFormFields } from '@/src/context';

export function CostCalculatorSubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId } = useCostCalculatorContext();
  const { components } = useFormFields();

  return (
    <components.button type='submit' {...props} form={formId}>
      {children}
    </components.button>
  );
}
