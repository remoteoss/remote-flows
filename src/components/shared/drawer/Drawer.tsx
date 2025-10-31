// In src/components/ui/data-drawer/DataDrawer.tsx

import { useFormFields } from '@/src/context';
import { DrawerComponentProps } from '@/src/types/remoteFlows';
import {
  Drawer as DrawerPrimitive,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/src/components/ui/drawer';
import { cn } from '@/src/lib/utils';

export type DrawerProps = DrawerComponentProps & {
  className?: string;
  direction?: 'left' | 'right';
};

export const Drawer = ({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  className = 'h-full w-[540px] mt-0 ml-auto px-4',
  direction = 'right',
}: DrawerProps) => {
  const { components } = useFormFields();
  const CustomDrawer = components?.drawer;

  if (CustomDrawer) {
    return (
      <CustomDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        trigger={trigger}
      >
        {children}
      </CustomDrawer>
    );
  }

  return (
    <DrawerPrimitive
      open={open}
      onOpenChange={onOpenChange}
      direction={direction}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className={cn(className, 'RemoteFlows__Drawer')}>
        <div className='h-full flex flex-col'>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className='flex-1 overflow-y-auto'>{children}</div>
        </div>
      </DrawerContent>
    </DrawerPrimitive>
  );
};
