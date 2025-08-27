/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextField, TextFieldProps } from './TextField';
import { Components } from '@/src/types/remoteFlows';

export type NumberFieldProps = TextFieldProps & {
  component?: Components['number'];
};

export function NumberField(props: NumberFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  const CustomNumberField = props.component || components?.number;

  if (CustomNumberField) {
    return (
      <FormField
        control={control}
        name={props.name}
        render={({ field, fieldState }) => {
          return (
            <CustomNumberField
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

  return (
    <TextField {...props} type='text' inputMode='decimal' pattern='^[0-9.]*$' />
  );
}
