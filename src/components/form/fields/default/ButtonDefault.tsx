import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ButtonComponentProps } from '@/src/types/remoteFlows';

export const ButtonDefault = React.forwardRef<
  HTMLButtonElement,
  ButtonComponentProps
>((props, ref) => {
  const {
    'data-type': dataType,
    'data-external': dataExternal,
    children,
    ...buttonProps
  } = props;

  const content: React.ReactNode = dataExternal ? (
    <>
      {children}
      <ExternalLink className='size-3' aria-hidden />
    </>
  ) : (
    (children as React.ReactNode)
  );

  if (dataType === 'inline') {
    return (
      <Button ref={ref} size='link' variant='link' {...buttonProps}>
        {content}
      </Button>
    );
  }

  return (
    <Button ref={ref} {...buttonProps}>
      {content}
    </Button>
  );
});

ButtonDefault.displayName = 'ButtonDefault';
