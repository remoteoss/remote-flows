import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { usePayrollEmployeeFederalTaxesContext } from '@/src/flows/PayrollEmployeeFederalTaxes/context';
import { useFormFields } from '@/src/context';

export function SubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { formId, flowBag } = usePayrollEmployeeFederalTaxesContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || flowBag.isSubmitting || !flowBag.isAvailable}
    >
      {children}
    </CustomButton>
  );
}
