import { useZendeskArticle } from '@/src/components/shared/zendesk-drawer/api';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/src/components/ui/drawer';
import { useFormFields } from '@/src/context';
import { buildZendeskURL } from '@/src/components/shared/zendesk-drawer/utils';

export type ZendeskDrawerProps = {
  Trigger: React.ReactElement;
  zendeskId: number;
  open: boolean;
  onClose: () => void;
};

export const ZendeskDrawer = ({
  Trigger,
  zendeskId,
  open,
  onClose,
}: ZendeskDrawerProps) => {
  const { components } = useFormFields();
  const zendeskURL = buildZendeskURL(zendeskId);

  const handleClose = () => {
    onClose?.();
  };

  const { data, isLoading, error } = useZendeskArticle(zendeskId, {
    enabled: open,
  });

  const CustomZendeskDrawer = components?.zendeskDrawer;

  if (CustomZendeskDrawer) {
    return (
      <CustomZendeskDrawer
        open={open}
        onClose={handleClose}
        data={data}
        isLoading={isLoading}
        error={error}
        zendeskURL={zendeskURL}
        Trigger={Trigger}
      />
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(open) => !open && handleClose()}
      direction='right'
    >
      <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
      <DrawerContent className='h-full w-[540px] mt-0 ml-auto RemoteFlows_ZendeskDrawer'>
        <div className='h-full flex flex-col'>
          <DrawerHeader>
            <DrawerTitle>{data?.title}</DrawerTitle>
            <DrawerDescription>
              For more details see our{' '}
              <a href={zendeskURL} target='_blank' rel='noopener noreferrer'>
                help article
              </a>{' '}
            </DrawerDescription>
          </DrawerHeader>
          {isLoading && <div>Loading...</div>}
          {error && (
            <div className='text-sm p-4 text-red-500'>
              Error loading article
            </div>
          )}
          <div
            className='flex-1 overflow-y-auto p-4 RemoteFlows_ZendeskDrawer__Content'
            dangerouslySetInnerHTML={{
              __html: data?.body || '',
            }}
          ></div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
