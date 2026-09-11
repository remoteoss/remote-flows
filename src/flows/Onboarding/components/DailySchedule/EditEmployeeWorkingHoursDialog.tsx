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
  close: () => void;
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
  /** Called when the dialog closes, used to reset form state */
  onClose?: () => void;
};

export const EditEmployeeWorkingHoursDialog = ({
  children,
  onClose,
}: EditEmployeeWorkingHoursDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onClose) {
      onClose();
    }
    setOpen(newOpen);
  };

  const close = () => {
    handleOpenChange(false);
  };

  return (
    <DialogControlContext.Provider value={{ close }}>
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
