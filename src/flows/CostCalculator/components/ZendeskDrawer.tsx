import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/src/components/ui/drawer';
import { useZendeskArticle } from '@/src/flows/Onboarding/api';
import { useRouter } from '@/src/lib/router';
import { useSearchParams } from '@/src/lib/useSearchParams';
import { sanitizeHtml } from '@/src/lib/utils';
import { useEffect, useState } from 'react';

export type ZendeskDrawerProps = {
  Trigger: React.ReactNode;
  zendeskId?: string;
};

export const ZendeskDrawer = ({ Trigger, zendeskId }: ZendeskDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const articleId = searchParams.get('articleId');
    setIsOpen(articleId === zendeskId);
  }, [searchParams, zendeskId]);

  const handleClose = () => {
    router.setSearchParams({ articleId: null });
    setIsOpen(false);
  };

  const { data, isLoading } = useZendeskArticle(zendeskId, {
    enabled: isOpen,
  });
  if (isLoading) return <div>Loading...</div>;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      direction="right"
    >
      <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
      <DrawerContent className="h-full w-[320px] mt-0 ml-auto">
        <div className="h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>{data?.data?.title}</DrawerTitle>
            <DrawerDescription
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(data?.data?.body || ''),
              }}
            />
          </DrawerHeader>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
