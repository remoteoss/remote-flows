import { Button } from '@/src/components/ui/button';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from './context';

export function TerminationSubmit(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  const { formId } = useTerminationContext();

  return (
    <Button {...props} form={formId}>
      {props.children}
    </Button>
  );
}
