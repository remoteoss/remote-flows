import { Button } from '@/src/components/ui/button';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useFormFields } from '@/src/context';

type OnboardingBackProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Record<string, unknown>;

export function OnboardingBack({
  children,
  onClick,
  ...props
}: PropsWithChildren<OnboardingBackProps>) {
  const {
    onboardingBag: { back, isEmploymentReadOnly },
  } = useOnboardingContext();

  const { components } = useFormFields();

  const onBackHandler = (evt: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: TBD if we want to allow back button to be clicked when employment is readonly
    if (!isEmploymentReadOnly) {
      back();
    }
    onClick?.(evt);
  };

  const CustomButton = components?.button;
  if (CustomButton) {
    return (
      <CustomButton {...props} onClick={onBackHandler}>
        {children}
      </CustomButton>
    );
  }

  return (
    <Button {...props} onClick={onBackHandler}>
      {children}
    </Button>
  );
}
