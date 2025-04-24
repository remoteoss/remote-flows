import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from '@/src/flows/Termination/context';

export function TerminationNext({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const {
    terminationBag: { nextStep },
  } = useTerminationContext();

  return (
    <Button
      {...props}
      onClick={() => {
        nextStep();
      }}
    >
      {children}
    </Button>
  );
}
