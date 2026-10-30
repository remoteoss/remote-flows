import { useRef } from 'react';
import { useFormFields } from '@/src/context';
import { useTimeOffContext } from '@/src/flows/TimeOff/context';
import {
  TimeOffApproveButtonProps,
  TimeOffDecisionError,
  TimeOffRequest,
} from '@/src/flows/TimeOff/types';
import { cn } from '@/src/lib/utils';

export function ApproveButton({
  children,
  approverId,
  onClick,
  onSuccess,
  onError,
  ...props
}: TimeOffApproveButtonProps) {
  const { timeOffBag } = useTimeOffContext();
  const { components } = useFormFields();
  const isApprovingRef = useRef(false);

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type='button'
      className={cn('RemoteFlows__ReviewStep__ApproveButton', props.className)}
      disabled={
        props.disabled || timeOffBag.isSubmitting || !timeOffBag.timeOffRequest
      }
      onClick={async (event) => {
        onClick?.(event);
        if (isApprovingRef.current) {
          return;
        }
        isApprovingRef.current = true;
        let timeOffRequest: TimeOffRequest;
        try {
          timeOffRequest = await timeOffBag.approve({ approverId });
        } catch (error) {
          onError?.(error as TimeOffDecisionError);
          return;
        } finally {
          isApprovingRef.current = false;
        }
        await onSuccess?.(timeOffRequest);
      }}
    >
      {children}
    </CustomButton>
  );
}
