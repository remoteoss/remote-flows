import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
import { cn } from '@remoteoss/remote-flows/internals';
import { DrawerComponentProps } from '@remoteoss/remote-flows';

export function DrawerDefault({
  open,
  onOpenChange,
  direction,
  className,
  title,
  trigger,
  children,
}: DrawerComponentProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent
        className={cn(
          'RemoteFlows__Drawer h-full w-[540px] mt-0 ml-auto px-4',
          className,
        )}
      >
        <div className='h-full flex flex-col'>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className='flex-1 overflow-y-auto'>{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
