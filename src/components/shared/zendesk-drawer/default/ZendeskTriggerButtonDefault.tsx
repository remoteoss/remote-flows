import * as React from 'react';
import { ZendeskTriggerButtonComponentProps } from '@/src/types/remoteFlows';
import { cn } from '@/src/lib/utils';
import { buildZendeskURL } from '../utils';

const baseClassName =
  'RemoteFlows__ZendeskTriggerButton text-blue-500 hover:underline inline-block text-xs bg-transparent border-none cursor-pointer p-0';

type KnownProps = {
  [
    K in keyof ZendeskTriggerButtonComponentProps as string extends K
      ? never
      : K
  ]: ZendeskTriggerButtonComponentProps[K];
};

export const ZendeskTriggerButtonDefault = React.forwardRef<
  HTMLElement,
  KnownProps
>(({ zendeskId, onClick, children, className, external }, ref) => {
  const handleClick = () => {
    onClick?.(zendeskId);
  };

  if (external) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
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
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type='button'
      onClick={handleClick}
      className={cn(baseClassName, className)}
    >
      {children}
    </button>
  );
});

ZendeskTriggerButtonDefault.displayName = 'ZendeskTriggerButtonDefault';
