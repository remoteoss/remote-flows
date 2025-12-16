import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useContractorOnboardingContext } from '@/src/flows/ContractorOnboarding/context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

export function OnboardingSubmit({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId, contractorOnboardingBag } = useContractorOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button || ButtonDefault;

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || contractorOnboardingBag.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
