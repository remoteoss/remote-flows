/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';

type MultiSelectFieldProps = JSFField & {
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (value: any) => void;
  component?: Components['select'];
};

export function MultiSelectField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  component,
  ...rest
}: MultiSelectFieldProps) {
  const { control } = useFormContext();
  const { components } = useFormFields();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components?.['multi-select'];
        if (!Component) {
          throw new Error(`Multi select component not found for field ${name}`);
        }

        const customSelectFieldProps = {
          label,
          name,
          options,
          defaultValue,
          description,
          onChange,
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
            fieldData={customSelectFieldProps}
          />
        );
      }}
    />
  );
}
