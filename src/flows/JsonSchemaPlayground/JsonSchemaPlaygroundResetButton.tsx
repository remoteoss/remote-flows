import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useJsonSchemaPlaygroundContext } from './context';
import { cn } from '@/src/lib/utils';
import { useFormFields } from '@/src/context';

export function JsonSchemaPlaygroundResetButton({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> &
  Record<string, unknown>) {
  const { form, formId, playgroundBag } = useJsonSchemaPlaygroundContext();
  const { components } = useFormFields();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error('Button component not found');
  }

  return (
    <CustomButton
      {...props}
      type="reset"
      className={cn(
        'RemoteFlows__JsonSchemaPlayground__ResetButton',
        props.className,
      )}
      form={formId}
      onClick={(evt) => {
        playgroundBag.handleReset();
        form.reset();
        props.onClick?.(evt);
      }}
    >
      {children}
    </CustomButton>
  );
}