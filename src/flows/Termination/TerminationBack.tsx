import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from '@/src/flows/Termination/context';

export function TerminationBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const {
    terminationBag: { back },
  } = useTerminationContext();

  return (
    <Button
      {...props}
      onClick={() => {
        back();
      }}
    >
      {children}
    </Button>
  );
}
