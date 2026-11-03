import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useFormFields } from '@/src/context';
import { useTimeOffListContext } from '@/src/flows/TimeOff/context';
import { cn } from '@/src/lib/utils';

export function NextPageButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { timeOffListBag } = useTimeOffListContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type='button'
      className={cn('RemoteFlows__ListStep__NextPageButton', props.className)}
      disabled={props.disabled || !timeOffListBag.hasNextPage}
      onClick={(event) => {
        timeOffListBag.nextPage();
        onClick?.(event);
      }}
    >
      {children}
    </CustomButton>
  );
}
