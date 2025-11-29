/* eslint-disable @typescript-eslint/no-explicit-any */

import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';

type CountryFieldProps = JSFField & {
  options: Array<{ value: string; label: string }>;
  onChange?: (value: any) => void;
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

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomSelectField = component || components.countries;

        const customSelectFieldProps = {
          label,
          name,
          options,
          defaultValue,
          description,
          onChange,
          $meta,
          ...rest,
        };
        return (
          <CustomSelectField
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
