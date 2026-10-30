import { useRef } from 'react';
import { useFormFields } from '@/src/context';
import { useTimeOffContext } from '@/src/flows/TimeOff/context';
import {
  TimeOffDeclineButtonProps,
  TimeOffDecisionError,
  TimeOffRequest,
} from '@/src/flows/TimeOff/types';
import { cn } from '@/src/lib/utils';

export function DeclineButton({
  children,
  declineReason,
  onClick,
  onSuccess,
  onError,
  ...props
}: TimeOffDeclineButtonProps) {
  const { timeOffBag } = useTimeOffContext();
  const { components } = useFormFields();
  const isDecliningRef = useRef(false);

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type='button'
      className={cn('RemoteFlows__ReviewStep__DeclineButton', props.className)}
      disabled={
        props.disabled || timeOffBag.isSubmitting || !timeOffBag.timeOffRequest
      }
      onClick={async (event) => {
        onClick?.(event);
        if (isDecliningRef.current) {
          return;
        }
        isDecliningRef.current = true;
        let timeOffRequest: TimeOffRequest;
        try {
          timeOffRequest = await timeOffBag.decline({ declineReason });
        } catch (error) {
          onError?.(error as TimeOffDecisionError);
          return;
        } finally {
          isDecliningRef.current = false;
        }
        await onSuccess?.(timeOffRequest);
      }}
    >
      {children}
    </CustomButton>
  );
}
