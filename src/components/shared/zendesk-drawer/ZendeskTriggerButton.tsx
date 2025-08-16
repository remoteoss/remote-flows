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
  className = 'text-blue-500 hover:underline block mt-1 text-xs bg-transparent border-none cursor-pointer p-0',
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
            'text-blue-500 hover:underline block mt-1 text-xs bg-transparent border-none cursor-pointer p-0',
            className,
          )}
        >
          {children}
        </button>
      }
    />
  );
}
