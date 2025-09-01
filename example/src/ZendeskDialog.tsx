import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  DialogTrigger,
} from '@remoteoss/remote-flows/internals';
import type { ZendeskDialogComponentProps } from '@remoteoss/remote-flows';

export function ZendeskDialog({
  open,
  onClose,
  data,
  isLoading,
  error,
  zendeskURL,
  Trigger,
}: ZendeskDialogComponentProps) {
  const triggerElement = React.isValidElement(Trigger) ? (
    Trigger
  ) : (
    <div>{Trigger}</div>
  );
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className='sm:max-w-[920px] max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle>{data?.title}</DialogTitle>
          <DialogDescription>
            For more details see our{' '}
            <a href={zendeskURL} target='_blank' rel='noopener noreferrer'>
              help article
            </a>{' '}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='h-[60vh] pr-4'>
          <div className='space-y-6'>
            {isLoading && <div>Loading...</div>}
            {error && (
              <div className='text-sm text-red-500'>Error loading article</div>
            )}
            <div
              className='flex-1 overflow-y-auto'
              dangerouslySetInnerHTML={{
                __html: data?.body || '',
              }}
            ></div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
