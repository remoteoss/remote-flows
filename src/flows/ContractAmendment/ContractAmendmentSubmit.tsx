import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

export function ContractAmendmentSubmit({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId, contractAmendment } = useContractAmendmentContext();
  const { components } = useFormFields();

  const CustomButton = components?.button || ButtonDefault;
  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || contractAmendment.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
