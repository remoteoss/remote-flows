import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
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

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  return (
    <CustomButton {...props} form={formId}>
      {children}
    </CustomButton>
  );
}
