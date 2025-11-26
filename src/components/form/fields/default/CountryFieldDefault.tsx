import { useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { MultiSelect } from '@/src/components/ui/multi-select';
import { $TSFixMe, FieldComponentProps } from '@/src/types/remoteFlows';

export function CountryFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const { name, label, description, options, $meta } = fieldData as $TSFixMe;
  const [selected, setSelected] = useState<$TSFixMe[]>([]);

  const countryOptions = [
    ...Object.entries($meta?.regions || {}).map(([key, value]) => ({
      value,
      label: key,
      category: 'Regions',
    })),
    ...Object.entries($meta?.subregions || {}).map(([key, value]) => ({
      value,
      label: key,
      category: 'Subregions',
    })),
    ...(options?.map((option: $TSFixMe) => ({
      ...option,
      value: option.value,
      label: option.label,
      category: 'Countries',
    })) || []),
  ];

  const handleChange = (rawValues: $TSFixMe[]) => {
    const values = rawValues.map(({ value }) => value);
    field.onChange(values);
    setSelected(rawValues);
  };

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__CountryField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__CountryField__Label'>
        {label}
      </FormLabel>
      <FormControl>
        <MultiSelect
          options={countryOptions}
          selected={selected}
          onChange={handleChange}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
