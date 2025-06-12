import { Button } from '@/src/components/ui/button';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useFormFields } from '@/src/context';
import { reviewStepAllowedEmploymentStatus } from '@/src/flows/Onboarding/utils';

type OnboardingBackProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onBackError?: (error: Error) => void;
} & Record<string, unknown>;

export function OnboardingBack({
  children,
  onClick,
  onBackError = () => {},
  ...props
}: PropsWithChildren<OnboardingBackProps>) {
  const {
    onboardingBag: { back, employment },
  } = useOnboardingContext();

  const { components } = useFormFields();

  const onBackHandler = (evt: React.MouseEvent<HTMLButtonElement>) => {
    if (
      employment &&
      !reviewStepAllowedEmploymentStatus.includes(employment?.status)
    ) {
      back();
    } else {
      onBackError(
        new Error('The employment is in a final state and cannot be modified.'),
      );
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
