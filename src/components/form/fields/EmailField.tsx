/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextField, TextFieldProps } from './TextField';

export function EmailField(props: TextFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  if (components?.email) {
    return (
      <FormField
        control={control}
        name={props.name}
        render={({ field, fieldState }) => {
          const CustomEmailField = components.email as React.ComponentType<any>;
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
