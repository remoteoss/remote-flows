/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextField, TextFieldProps } from './TextField';
import { Components } from '@/src/types/remoteFlows';

type EmailFieldProps = TextFieldProps & {
  component?: Components['email'];
};

export function EmailField(props: EmailFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  const CustomEmailField = props.component || components?.email;

  if (CustomEmailField) {
    return (
      <FormField
        control={control}
        name={props.name}
        render={({ field, fieldState }) => {
          return (
            <CustomEmailField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  props.onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={props}
            />
          );
        }}
      />
    );
  }

  return <TextField {...props} type="email" />;
}
