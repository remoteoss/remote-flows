import { useFormFields } from '@/src/context';
import { DrawerComponentProps } from '@/src/types/remoteFlows';

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
  className = '',
  direction = 'right',
}: DrawerProps) => {
  const { components } = useFormFields();
  const CustomDrawer = components?.drawer;

  if (!CustomDrawer) {
    throw new Error(`Drawer component not found`);
  }

  return (
    <CustomDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      trigger={trigger}
      direction={direction}
      className={className}
    >
      {children}
    </CustomDrawer>
  );
};
