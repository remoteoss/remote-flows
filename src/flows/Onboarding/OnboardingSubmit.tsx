import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Button } from '@/src/components/ui/button';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';

export function OnboardingSubmit({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { formId } = useOnboardingContext();

  return (
    <Button {...props} form={formId}>
      {children}
    </Button>
  );
}
