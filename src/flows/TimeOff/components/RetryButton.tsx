import { ButtonHTMLAttributes, PropsWithChildren, useState } from 'react';
import { useFormFields } from '@/src/context';
import { useTimeOffContext } from '@/src/flows/TimeOff/context';
import { cn } from '@/src/lib/utils';

export function RetryButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { timeOffBag } = useTimeOffContext();
  const { components } = useFormFields();
  const [isRetrying, setIsRetrying] = useState(false);

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type='button'
      className={cn('RemoteFlows__ReviewStep__RetryButton', props.className)}
      disabled={props.disabled || isRetrying}
      onClick={async (event) => {
        onClick?.(event);
        setIsRetrying(true);
        await timeOffBag.refetchTimeOffRequest();
        setIsRetrying(false);
      }}
    >
      {children}
    </CustomButton>
  );
}
