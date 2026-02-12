import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useCreateCompanyContext } from '@/src/flows/CreateCompany/context';
import { useFormFields } from '@/src/context';

export function CreateCompanySubmit({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId } = useCreateCompanyContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled}
    >
      {children}
    </CustomButton>
  );
}
