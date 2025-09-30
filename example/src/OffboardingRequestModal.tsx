import { TerminationDialogInfoContent } from '@remoteoss/remote-flows';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  ScrollArea,
} from '@remoteoss/remote-flows/internals';

export function OffboardingRequestModal({
  employee,
}: {
  employee: { name: string };
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open Modal</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle>Offboarding Request for {employee.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[60vh] pr-4'>
          <div className='grid gap-4 py-4'>
            <TerminationDialogInfoContent />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
