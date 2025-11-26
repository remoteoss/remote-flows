import { Button } from '@/src/components/ui/button';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useFormFields } from '@/src/context';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';

type OnboardingBackProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Record<string, unknown>;

export function OnboardingBack({
  children,
  onClick,
  ...props
}: PropsWithChildren<OnboardingBackProps>) {
  const { contractorOnboardingBag } = useContractorOnboardingContext();

  const { components } = useFormFields();

  const onBackHandler = (evt: React.MouseEvent<HTMLButtonElement>) => {
    if (!contractorOnboardingBag.isEmploymentReadOnly) {
      contractorOnboardingBag.back();
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
