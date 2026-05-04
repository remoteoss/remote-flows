import { useFormFields, useTransformer } from '@/src/context';
import { Components, JSFField, $TSFixMe } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';

type CountryFieldProps = JSFField & {
  options: Array<{ value: string; label: string }>;
  onChange?: (value: $TSFixMe) => void;
  $meta: {
    regions: Record<string, string[]>;
    subregions: Record<string, string[]>;
  };
  component?: Components['countries'];
};

export function CountryField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  $meta,
  component,
  ...rest
}: CountryFieldProps) {
  const { control } = useFormContext();
  const { components } = useFormFields();
  const transformHtml = useTransformer();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components.countries;
        if (!Component) {
          throw new Error(`Country component not found for field ${name}`);
        }

        const customSelectFieldProps = {
          label,
          name,
          options,
          defaultValue,
          description,
          onChange,
          $meta,
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
