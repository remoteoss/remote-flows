import { useFormFields, useTransformer } from '@/src/context';
import { Components, JSFField, $TSFixMe } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';

type MultiSelectFieldProps = JSFField & {
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (value: $TSFixMe) => void;
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
  const transformHtml = useTransformer();

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
            fieldData={customSelectFieldProps}
          />
        );
      }}
    />
  );
}
