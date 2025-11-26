/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextAreaFieldDefault } from './default/TextAreaFieldDefault';

export type TextAreaFieldProps = JSFField & {
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  component?: Components['textarea'];
};

export function TextAreaField({
  name,
  description,
  label,
  onChange,
  maxLength,
  component,
  ...rest
}: TextAreaFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomTextAreaField = component || components?.textarea;
        const Component = CustomTextAreaField || TextAreaFieldDefault;

        const fieldData = {
          name,
          description,
          label,
          maxLength,
          ...rest,
        };

        return (
          <Component
            field={{
              ...field,
              onChange: (value: any) => {
                field.onChange(value);
                onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={fieldData}
          />
        );
      }}
    />
  );
}
