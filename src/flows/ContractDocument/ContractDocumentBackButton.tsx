import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useFormFields } from '@/src/context';
import { useContractDocumentContext } from '@/src/flows/ContractDocument/context';
import { cn } from '@/src/lib/utils';

export function ContractDocumentBackButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { contractDocumentBag } = useContractDocumentContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      type='button'
      className={cn(
        'RemoteFlows__ContractDocument__BackButton',
        props.className,
      )}
      onClick={(event) => {
        contractDocumentBag.back();
        onClick?.(event);
      }}
    >
      {children}
    </CustomButton>
  );
}
