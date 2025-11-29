import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useFormFields } from '@/src/context';

export function OnboardingSubmit({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId } = useOnboardingContext();
  const { components } = useFormFields();

  return (
    <components.button {...props} form={formId}>
      {children}
    </components.button>
  );
}
