import { useFormFields } from '@/src/context';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextField, TextFieldProps } from './TextField';

export function NumberField(props: TextFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  if (components?.number) {
    return (
      <FormField
        control={control}
        name={props.name}
        render={({ field, fieldState }) => {
          const CustomNumberField =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            components.number as React.ComponentType<any>;
          return (
            <CustomNumberField
              field={field}
              fieldState={fieldState}
              fieldData={props}
            />
          );
        }}
      />
    );
  }

  return (
    <TextField {...props} type="text" inputMode="decimal" pattern="^[0-9.]*$" />
  );
}
