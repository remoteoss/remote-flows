import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useJsonSchemaPlaygroundContext } from './context';
import { useFormFields } from '@/src/context';

export function JsonSchemaPlaygroundSubmitButton({
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>
>) {
  const { formId, playgroundBag } = useJsonSchemaPlaygroundContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      form={formId}
      disabled={props.disabled || playgroundBag.isSubmitting}
    >
      {playgroundBag.isSubmitting ? 'Submitting...' : children}
    </CustomButton>
  );
}
