import { ComponentType, useState } from 'react';
import type { TimeOffDeclineButtonProps } from '@remoteoss/remote-flows';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@remoteoss/remote-flows/internals';

type TimeOffDeclineDialogProps = Pick<
  TimeOffDeclineButtonProps,
  'onClick' | 'onSuccess' | 'onError'
> & {
  DeclineButton: ComponentType<TimeOffDeclineButtonProps>;
  disabled?: boolean;
};

export function TimeOffDeclineDialog({
  DeclineButton,
  disabled,
  onClick,
  onSuccess,
  onError,
}: TimeOffDeclineDialogProps) {
  const [open, setOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!disabled) {
          setOpen(nextOpen);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type='button' className='back-button' disabled={disabled}>
          Decline
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Decline time-off request</DialogTitle>
          <DialogDescription>
            Add an optional reason before declining this request.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor='decline-reason' className='mb-2'>
            Decline reason (optional)
          </Label>
          <Input
            id='decline-reason'
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type='button'
            className='back-button'
            disabled={disabled}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <DeclineButton
            className='submit-button'
            declineReason={declineReason.trim() || null}
            onClick={onClick}
            onSuccess={async (timeOffRequest) => {
              setOpen(false);
              await onSuccess?.(timeOffRequest);
            }}
            onError={(error) => {
              setOpen(false);
              onError?.(error);
            }}
          >
            Decline
          </DeclineButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
