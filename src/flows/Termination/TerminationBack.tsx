import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from '@/src/flows/Termination/context';
import { useFormFields } from '@/src/context';

export function TerminationBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const {
    terminationBag: { back },
  } = useTerminationContext();

  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton
      {...props}
      onClick={(evt) => {
        back();
        props.onClick?.(evt);
      }}
    >
      {children}
    </CustomButton>
  );
}
