import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from './context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

export function TerminationSubmit({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId, terminationBag } = useTerminationContext();
  const { components } = useFormFields();

  const CustomButton = components?.button || ButtonDefault;
  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || terminationBag.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
