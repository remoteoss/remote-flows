import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTerminationContext } from '@/src/flows/Termination/context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

export function TerminationBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const {
    terminationBag: { back },
  } = useTerminationContext();

  const { components } = useFormFields();

  const CustomButton = components?.button || ButtonDefault;
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
