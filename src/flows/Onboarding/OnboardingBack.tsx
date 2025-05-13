import { Button } from '@/src/components/ui/button';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export function OnboardingBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  //   const {
  //     onboarding: { back },
  //   } = useOnboardingContext();

  return (
    <Button
      {...props}
      onClick={() => {
        /** @todo: Implement back button */
      }}
    >
      {children}
    </Button>
  );
}
