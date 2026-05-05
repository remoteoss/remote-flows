import * as React from 'react';

import { useFormFields, useTransformer } from '@/src/context';
import { Components, JSFField, $TSFixMe } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextFieldDataProps } from '@/src/types/fields';

export type TextFieldProps = React.ComponentProps<'input'> & {
  name: string;
} & Partial<
    JSFField & {
      onChange?: (value: $TSFixMe) => void;
      component?: Components['text'];
      includeErrorMessage?: boolean;
      additionalProps?: Record<string, unknown>;
    }
  >;

type CustomTextFieldProps = TextFieldDataProps & {
  /**
   * @deprecated avoid using this prop in custom components
   */
  onChange?: (value: $TSFixMe) => void;
};

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
  const transformHtml = useTransformer();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components?.text;

        if (!Component) {
          throw new Error(`Text component not found for field ${name}`);
        }

        const customTextFieldProps: CustomTextFieldProps = {
          name,
          description,
          label,
          type,
          onChange,
          metadata: additionalProps,
          maxLength,
          includeErrorMessage,
          transformHtml,
          ...rest,
        };
        return (
          <Component
            field={{
              ...field,
              onChange: (value: $TSFixMe) => {
                field.onChange(value);
                onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={customTextFieldProps}
          />
        );
      }}
    />
  );
}
