import { useFormFields } from '@/src/context';
import { DrawerComponentProps } from '@/src/types/remoteFlows';
import { DrawerDefault } from '@/src/components/form/fields/default/DrawerDefault';

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
  const CustomDrawer = components?.drawer || DrawerDefault;

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
