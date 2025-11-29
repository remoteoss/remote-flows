import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useFormFields } from '@/src/context';

export function OnboardingSubmit({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId } = useContractorOnboardingContext();
  const { components } = useFormFields();

  return (
    <components.button {...props} form={formId}>
      {children}
    </components.button>
  );
}
