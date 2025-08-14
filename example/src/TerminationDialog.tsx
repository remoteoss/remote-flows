import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@remoteoss/remote-flows/internals';

export function TerminationDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>Termination Reasons</DialogTitle>
          <DialogDescription>
            We're here to help you follow all applicable labor laws when
            terminating an employee. Here are all the legal reasons for
            termination. Please read them to make sure you enter the correct
            reason in the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4"></div>
      </DialogContent>
    </Dialog>
  );
}
