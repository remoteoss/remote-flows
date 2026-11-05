import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { EyeIcon } from 'lucide-react';
import { useFormFields } from '@/src/context';
import {
  useTimeOffListContext,
  useTimeOffReviewContext,
} from '@/src/flows/TimeOff/context';
import { cn } from '@/src/lib/utils';

export function ViewButton({
  children,
  onClick,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { timeOffListBag } = useTimeOffListContext();
  const { timeOffBag } = useTimeOffReviewContext();
  const { components } = useFormFields();
  const { timeOffRequest } = timeOffBag;

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      aria-label={children ? undefined : 'View'}
      {...props}
      type='button'
      className={cn('RemoteFlows__ListStep__ViewButton', props.className)}
      disabled={props.disabled || !timeOffRequest}
      onClick={(event) => {
        if (timeOffRequest) {
          timeOffListBag.selectTimeOffRequest(timeOffRequest.id);
        }
        onClick?.(event);
      }}
    >
      {children ?? <EyeIcon />}
    </CustomButton>
  );
}
