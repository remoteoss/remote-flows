import * as React from 'react';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '@/src/components/ui/form';

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
        const Component = component || components.textarea;
        if (!Component) {
          throw new Error(`Text area component not found for field ${name}`);
        }
        const customTextAreaFieldProps = {
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
              onChange: (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
                field.onChange(evt);
                onChange?.(evt);
              },
            }}
            fieldState={fieldState}
            fieldData={customTextAreaFieldProps}
          />
        );
      }}
    />
  );
}
