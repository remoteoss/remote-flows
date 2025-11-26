/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { useState } from 'react';
import { MultiSelectFieldDefault } from './default/MultiSelectFieldDefault';

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
  const [selected, setSelected] = useState<any[]>();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomSelectField = component || components?.['multi-select'];
        const Component = CustomSelectField || MultiSelectFieldDefault;

        const selectedOptions =
          selected ||
          options.filter((option) => field.value?.includes(option.value));

        const fieldData = {
          label,
          name,
          options,
          defaultValue,
          description,
          selected: selectedOptions,
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
            fieldData={fieldData}
          />
        );
      }}
    />
  );
}
