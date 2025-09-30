import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  ScrollArea,
  DialogTitle,
} from '@remoteoss/remote-flows/internals';

export function TerminationReasonsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <a href='#' className='text-blue-500'>
          Learn more termination details
        </a>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle>Termination Reasons</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[60vh] pr-4'>
          <div className='grid gap-4 py-4'>HELLO</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
