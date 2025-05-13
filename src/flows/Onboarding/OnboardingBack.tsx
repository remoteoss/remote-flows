import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';

export function OnboardingBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const {
    onboardingBag: { back },
  } = useOnboardingContext();

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
