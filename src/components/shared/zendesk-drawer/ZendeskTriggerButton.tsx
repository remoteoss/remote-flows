import { cn } from '@/src/lib/utils';
import { ZendeskDrawer } from './ZendeskDrawer';
import { buildZendeskURL } from './utils';
import { useState } from 'react';

interface ZendeskTriggerButtonProps {
  zendeskId: number;
  className?: string;
  onClick?: (zendeskId: number) => void;
  children?: React.ReactNode;
  external?: boolean;
}

const baseClassName =
  'RemoteFlows__ZendeskTriggerButton text-blue-500 hover:underline inline-block text-xs bg-transparent border-none cursor-pointer p-0';

export function ZendeskTriggerButton({
  zendeskId,
  className,
  onClick,
  children,
  external = false,
}: ZendeskTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (!external) {
      setIsOpen(true);
    }
    onClick?.(zendeskId);
  };

  if (external) {
    return (
      <a
        href={buildZendeskURL(zendeskId)}
        target='_blank'
        rel='noopener noreferrer'
        onClick={handleClick}
        className={cn(baseClassName, className)}
      >
        {children}
      </a>
    );
  }

  return (
    <ZendeskDrawer
      zendeskId={zendeskId}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      Trigger={
        <button onClick={handleClick} className={cn(baseClassName, className)}>
          {children}
        </button>
      }
    />
  );
}
