import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';

export function ContractDocumentSubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId, contractDocumentBag } = useContractDocumentContext();
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
        'RemoteFlows__ContractDocumentForm__SubmitButton',
        props.className,
      )}
      form={formId}
      disabled={
        props.disabled ||
        contractDocumentBag.isSubmitting ||
        !contractDocumentBag.employmentId
      }
    >
      {children}
    </CustomButton>
  );
}
