/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextFieldDefault } from './default/TextFieldDefault';

export type TextFieldProps = React.ComponentProps<'input'> & {
  name: string;
} & Partial<
    JSFField & {
      onChange?: (value: any) => void;
      component?: Components['text'];
      includeErrorMessage?: boolean;
      additionalProps?: Record<string, unknown>;
    }
  >;

export function TextField({
  name,
  description,
  label,
  type,
  onChange,
  component,
  includeErrorMessage = true,
  additionalProps = {},
  maxLength,
  ...rest
}: TextFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomTextField = component || components?.text;
        const Component = CustomTextField || TextFieldDefault;

        const fieldData = {
          name,
          description,
          label,
          type,
          onChange,
          metadata: additionalProps,
          maxLength,
          includeErrorMessage,
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
