import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useFormFields } from '@/src/context';
import { useTimeOffContext } from '@/src/flows/TimeOff/context';
import { cn } from '@/src/lib/utils';

export function NextButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { formId, timeOffBag } = useTimeOffContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type='submit'
      className={cn('RemoteFlows__RequestIdStep__NextButton', props.className)}
      form={formId}
      disabled={props.disabled || !timeOffBag.hasRequestId}
    >
      {children}
    </CustomButton>
  );
}
