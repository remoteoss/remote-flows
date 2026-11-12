import * as React from 'react';
import { Button } from '@/src/components/ui/button';
import { ButtonComponentProps } from '@/src/types/remoteFlows';

export const ButtonDefault = React.forwardRef<
  HTMLButtonElement,
  ButtonComponentProps
>((props, ref) => {
  const { 'data-type': dataType, ...buttonProps } = props;

  if (dataType === 'inline') {
    return <Button ref={ref} size='link' variant='link' {...buttonProps} />;
  }

  return <Button ref={ref} {...buttonProps} />;
});

ButtonDefault.displayName = 'ButtonDefault';
