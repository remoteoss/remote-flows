import * as React from 'react';

import { useFormFields, useTransformer } from '@/src/context';
import { Components, JSFField, $TSFixMe } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TimeFieldDataProps } from '@/src/types/fields';

export type TimeFieldProps = JSFField & {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  component?: Components['time'];
};

export function TimeField({
  name,
  description,
  label,
  type,
  onChange,
  component,
  maxLength,
  ...rest
}: TimeFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  const transformHtml = useTransformer();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components?.time;

        if (!Component) {
          throw new Error(`Time component not found for field ${name}`);
        }

        const customTimeFieldProps: TimeFieldDataProps = {
          name,
          description,
          label,
          type,
          onChange,
          maxLength,
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
            fieldData={customTimeFieldProps}
          />
        );
      }}
    />
  );
}
