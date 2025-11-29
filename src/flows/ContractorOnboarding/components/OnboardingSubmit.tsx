import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Button } from '@/src/components/ui/button';
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

  const CustomButton = components?.button || Button;

  return (
    <CustomButton {...props} form={formId}>
      {children}
    </CustomButton>
  );
}
