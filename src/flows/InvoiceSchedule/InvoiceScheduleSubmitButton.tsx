import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useInvoiceScheduleContext } from '@/src/flows/InvoiceSchedule/context';
import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';

export function InvoiceScheduleSubmitButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { formId, invoiceScheduleBag } = useInvoiceScheduleContext();
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
        'RemoteFlows__InvoiceScheduleForm__SubmitButton',
        props.className,
      )}
      form={formId}
      disabled={props.disabled || invoiceScheduleBag?.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
