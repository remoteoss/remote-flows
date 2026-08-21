import { ZendeskTriggerButtonComponentProps } from '@/src/types/remoteFlows';
import { cn } from '@/src/lib/utils';
import { buildZendeskURL } from '../utils';

const baseClassName =
  'RemoteFlows__ZendeskTriggerButton text-blue-500 hover:underline inline-block text-xs bg-transparent border-none cursor-pointer p-0';

export function ZendeskTriggerButtonDefault({
  zendeskId,
  onClick,
  children,
  className,
  external,
}: ZendeskTriggerButtonComponentProps) {
  const handleClick = () => {
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
    <button onClick={handleClick} className={cn(baseClassName, className)}>
      {children}
    </button>
  );
}
