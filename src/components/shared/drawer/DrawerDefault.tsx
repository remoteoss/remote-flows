import { DrawerComponentProps } from '@/src/types/remoteFlows';
import {
  Drawer as DrawerPrimitive,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/src/components/ui/drawer';
import { cn } from '@/src/lib/utils';
import { useFormFields } from '@/src/context';

export function DrawerDefault({
  open,
  onOpenChange,
  direction,
  className,
  title,
  trigger,
  children,
}: DrawerComponentProps) {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) {
    console.log('Missing component: DrawerDefault');
    return null;
  }
  return (
    <DrawerPrimitive
      open={open}
      onOpenChange={onOpenChange}
      direction={direction}
    >
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
    </DrawerPrimitive>
  );
}
