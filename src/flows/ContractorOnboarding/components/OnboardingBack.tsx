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
  const {
    contractorOnboardingBag: { back, isEmploymentReadOnly },
  } = useContractorOnboardingContext();

  const { components } = useFormFields();

  const onBackHandler = (evt: React.MouseEvent<HTMLButtonElement>) => {
    if (!isEmploymentReadOnly) {
      back();
    }
    onClick?.(evt);
  };

  const CustomButton = components?.button || Button;

  return (
    <CustomButton {...props} onClick={onBackHandler}>
      {children}
    </CustomButton>
  );
}
