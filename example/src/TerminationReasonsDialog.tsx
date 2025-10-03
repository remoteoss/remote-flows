import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  ScrollArea,
  DialogTitle,
} from '@remoteoss/remote-flows/internals';
import { TerminationReasonsDetailContent } from '@remoteoss/remote-flows';

export function TerminationReasonsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <a href='#' className='text-blue-500'>
          Learn more termination details
        </a>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[400px] max-h-[60vh] w-[90vw] min-w-[300px]'>
        <DialogHeader>
          <DialogTitle>Termination Reasons</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[60vh] pr-4'>
          <div className='grid gap-4 py-4'>
            <TerminationReasonsDetailContent />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
