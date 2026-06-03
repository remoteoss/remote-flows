import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/src/lib/utils';

function FullScreenDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='full-screen-dialog' {...props} />;
}

function FullScreenDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot='full-screen-dialog-trigger'
      {...props}
    />
  );
}

function FullScreenDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return (
    <DialogPrimitive.Portal data-slot='full-screen-dialog-portal' {...props} />
  );
}

function FullScreenDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close data-slot='full-screen-dialog-close' {...props} />
  );
}

function FullScreenDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot='full-screen-dialog-overlay'
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

function FullScreenDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <FullScreenDialogPortal data-slot='full-screen-dialog-portal'>
      <FullScreenDialogOverlay />
      <DialogPrimitive.Content
        data-slot='full-screen-dialog-content'
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 flex flex-col',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 RemoteFlows__FullScreenDialog__Close">
          <XIcon />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </FullScreenDialogPortal>
  );
}

function FullScreenDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='full-screen-dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function FullScreenDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='full-screen-dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

function FullScreenDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='full-screen-dialog-title'
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function FullScreenDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot='full-screen-dialog-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  FullScreenDialog,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogDescription,
  FullScreenDialogFooter,
  FullScreenDialogHeader,
  FullScreenDialogOverlay,
  FullScreenDialogPortal,
  FullScreenDialogTitle,
  FullScreenDialogTrigger,
};
