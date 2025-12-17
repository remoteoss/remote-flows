import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { useFormFields } from '@/src/context';

export function OnboardingSubmit({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId, onboardingBag } = useOnboardingContext();
  const { components } = useFormFields();

  const CustomButton = components?.button || ButtonDefault;
  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || onboardingBag.isSubmitting}
    >
      {children}
    </CustomButton>
  );
}
