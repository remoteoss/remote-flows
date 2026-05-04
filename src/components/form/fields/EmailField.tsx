import { useFormFields, useTransformer } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextFieldProps } from './TextField';
import { Components } from '@/src/types/remoteFlows';

type EmailFieldProps = TextFieldProps & {
  component?: Components['email'];
};

export function EmailField({ component, onChange, ...props }: EmailFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  const transformHtml = useTransformer();

  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field, fieldState }) => {
        const Component = component || components.email;

        if (!Component) {
          throw new Error(`Email component not found for field ${props.name}`);
        }

        const customEmailFieldProps = {
          onChange,
          transformHtml,
          ...props,
        };
        return (
          <Component
            field={{
              ...field,
              onChange: (value: string) => {
                field.onChange(value);
                onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={customEmailFieldProps}
          />
        );
      }}
    />
  );
}
