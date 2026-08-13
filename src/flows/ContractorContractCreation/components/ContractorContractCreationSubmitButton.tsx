import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractorContractCreationContext } from '@/src/flows/ContractorContractCreation/context';
import { useFormFields } from '@/src/context';

/**
 * Submit button for contractor contract creation form
 * Must be used within ContractorContractCreationFlow render prop
 */
export function ContractorContractCreationSubmitButton({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId, contractorContractCreationBag } =
    useContractorContractCreationContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || contractorContractCreationBag.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
