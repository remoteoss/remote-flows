/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

import { useFormFields } from '@/src/context';
import { $TSFixMe, Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { CountryFieldDefault } from './default/CountryFieldDefault';

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
  const [selected, setSelected] = useState<any[]>([]);

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomSelectField = component || components?.countries;
        const Component = CustomSelectField || CountryFieldDefault;

        const fieldData = {
          label,
          name,
          options,
          defaultValue,
          description,
          $meta,
          selected,
          ...rest,
        };

        return (
          <Component
            field={{
              ...field,
              onChange: (rawValues: any) => {
                const values = Array.isArray(rawValues)
                  ? rawValues.map((v) => (typeof v === 'object' ? v.value : v))
                  : rawValues;
                field.onChange(values);
                onChange?.(values);
                if (Array.isArray(rawValues)) {
                  setSelected(rawValues);
                }
              },
            }}
            fieldState={fieldState}
            fieldData={fieldData as $TSFixMe}
          />
        );
      }}
    />
  );
}
