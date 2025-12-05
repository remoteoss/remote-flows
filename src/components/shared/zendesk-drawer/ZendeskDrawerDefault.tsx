import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/src/components/ui/drawer';
import { ZendeskDrawerComponentProps } from '@/src/types/remoteFlows';

export function ZendeskDrawerDefault({
  open,
  onClose,
  data,
  isLoading,
  error,
  zendeskURL,
  Trigger,
}: ZendeskDrawerComponentProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={(open) => !open && onClose()}
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
}
