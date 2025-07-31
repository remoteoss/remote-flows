import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/src/components/ui/drawer';
import { useZendeskArticle } from '@/src/flows/Onboarding/api';
import { useEffect, useState } from 'react';

export type ZendeskDrawerProps = {
  Trigger: React.ReactNode;
  zendeskId?: string;
};

export const ZendeskDrawer = ({ Trigger, zendeskId }: ZendeskDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkUrlParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const articleParam = searchParams.get('articleId');
      setIsOpen(articleParam === zendeskId);
    };

    // Check initial state
    checkUrlParams();

    // Listen for URL changes
    const handleUrlChange = () => {
      checkUrlParams();
    };

    // Listen for browser back/forward
    window.addEventListener('popstate', handleUrlChange);

    // Listen for programmatic URL changes (your pushState calls)
    window.addEventListener('urlChanged', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('urlChanged', handleUrlChange);
    };
  }, [zendeskId]);

  const handleClose = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('articleId');
    window.history.pushState({}, '', url.toString());
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('urlChanged'));
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
              dangerouslySetInnerHTML={{ __html: data?.data?.body || '' }}
            />
          </DrawerHeader>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
