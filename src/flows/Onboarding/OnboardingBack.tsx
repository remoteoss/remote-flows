import { Button } from '@/src/components/ui/button';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useFormFields } from '@/src/context';

export function OnboardingBack({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const {
    onboardingBag: { back },
  } = useOnboardingContext();

  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (CustomButton) {
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
