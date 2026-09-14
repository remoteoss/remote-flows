import { createContext, useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';

type DialogControlContextValue = {
<<<<<<< HEAD
  /** Closes the dialog as-is, without discarding form state (used after a successful save). */
  close: () => void;
  /** Discards unsaved edits and closes the dialog. */
  cancel: () => void;
=======
  close: () => void;
>>>>>>> main
};

const DialogControlContext = createContext<DialogControlContextValue | null>(
  null,
);

export const useDialogControl = () => {
  const context = useContext(DialogControlContext);
  if (!context) {
    throw new Error(
      'useDialogControl must be used within EditEmployeeWorkingHoursDialog',
    );
  }
  return context;
};

type EditEmployeeWorkingHoursDialogProps = {
  children: React.ReactNode;
<<<<<<< HEAD
  /**
   * Called whenever the dialog closes without saving — Cancel, overlay
   * click, Escape, or the close button — so the parent can reset the edit
   * form back to the last saved schedule before it's shown again.
   */
  onClose?: () => void;
=======
>>>>>>> main
};

export const EditEmployeeWorkingHoursDialog = ({
  children,
  onClose,
}: EditEmployeeWorkingHoursDialogProps) => {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };

  const cancel = () => {
    onClose?.();
    setOpen(false);
  };

  // Radix funnels the close button, overlay click, and Escape all through
  // `onOpenChange(false)` — treat those the same as an explicit Cancel.
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      cancel();
      return;
    }
    setOpen(nextOpen);
  };

  return (
    <DialogControlContext.Provider value={{ close, cancel }}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant='link'
            className='flex items-center p-0 self-start RemoteFlows__DailySchedule__Trigger'
          >
            Edit schedule
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-4 RemoteFlows__DailySchedule__Content'>
          <DialogHeader>
            <DialogTitle className='RemoteFlows__DailySchedule__Title'>
              Edit employee working hours
            </DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </DialogControlContext.Provider>
  );
};
