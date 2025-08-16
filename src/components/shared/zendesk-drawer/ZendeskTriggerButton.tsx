import { cn } from '@/src/lib/utils';
import { ZendeskDrawer } from './ZendeskDrawer';
import { useRouter } from '@/src/lib/router';

interface ZendeskTriggerButtonProps {
  zendeskId: string;
  zendeskURL: string;
  className?: string;
  onClick?: (zendeskId: string) => void;
  children?: React.ReactNode;
}

export function ZendeskTriggerButton({
  zendeskId,
  zendeskURL,
  className,
  onClick,
  children,
}: ZendeskTriggerButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.setSearchParams({
      articleId: zendeskId || '',
    });

    onClick?.(zendeskId);
  };

  return (
    <ZendeskDrawer
      zendeskId={zendeskId}
      zendeskURL={zendeskURL}
      Trigger={
        <button
          onClick={handleClick}
          className={cn(
            'RemoteFlows__ZendeskTriggerButton text-blue-500 hover:underline inline-block mt-1 text-xs bg-transparent border-none cursor-pointer p-0',
            className,
          )}
        >
          {children}
        </button>
      }
    />
  );
}
