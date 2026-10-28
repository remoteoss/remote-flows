import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useFormFields } from '@/src/context';
import { useTimeOffContext } from '@/src/flows/TimeOff/context';
import { cn } from '@/src/lib/utils';

export function BackButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { timeOffBag } = useTimeOffContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type='button'
      className={cn('RemoteFlows__ReviewStep__BackButton', props.className)}
      onClick={(event) => {
        timeOffBag.back();
        onClick?.(event);
      }}
    >
      {children}
    </CustomButton>
  );
}
