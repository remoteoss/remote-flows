import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractAmendmentContext } from './context';
import { useFormFields } from '@/src/context';

export function ContractAmendmentBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const {
    contractAmendment: { back },
  } = useContractAmendmentContext();

  const { components } = useFormFields();

  return (
    <components.button
      {...props}
      onClick={(evt) => {
        back();
        props.onClick?.(evt);
      }}
    >
      {children}
    </components.button>
  );
}
