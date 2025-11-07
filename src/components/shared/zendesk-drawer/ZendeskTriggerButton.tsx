import { cn } from '@/src/lib/utils';
import { ZendeskDrawer } from './ZendeskDrawer';
import { useState } from 'react';

interface ZendeskTriggerButtonProps {
  zendeskId: number;
  className?: string;
  onClick?: (zendeskId: number) => void;
  children?: React.ReactNode;
}

export function ZendeskTriggerButton({
  zendeskId,
  className,
  onClick,
  children,
}: ZendeskTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
    onClick?.(zendeskId);
  };

  return (
    <ZendeskDrawer
      zendeskId={zendeskId}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      Trigger={
        <button
          onClick={handleClick}
          className={cn(
            'RemoteFlows__ZendeskTriggerButton text-blue-500 hover:underline inline-block text-xs bg-transparent border-none cursor-pointer p-0',
            className,
          )}
        >
          {children}
        </button>
      }
    />
  );
}
