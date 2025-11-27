import { useEffect, useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';

import { FormItem } from '@/src/components/ui/form';
import { MultiSelect } from '@/src/components/ui/multi-select';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { CountryComponentProps } from '@/src/types/fields';

export function CountryFieldDefault({
  field,
  fieldState,
  fieldData,
}: CountryComponentProps) {
  const [selected, setSelected] = useState<$TSFixMe[]>([]);
  const handleChange = (rawValues: $TSFixMe[]) => {
    const values = rawValues.map(({ value }) => value);
    field.onChange(values);
    setSelected(rawValues);
  };

  useEffect(() => {
    if (field.value && fieldData.options) {
      setSelected(
        field.value.map(
          (value: $TSFixMe) =>
            fieldData?.options?.find(
              (option) => option.value === value,
            ) as $TSFixMe,
        ),
      );
    }
  }, [field.value, fieldData.options]);

  const countryOptions = [
    ...Object.entries(fieldData.$meta?.regions || {}).map(([key, value]) => ({
      value,
      label: key,
      category: 'Regions',
    })),
    ...Object.entries(fieldData.$meta?.subregions || {}).map(
      ([key, value]) => ({
        value,
        label: key,
        category: 'Subregions',
      }),
    ),
    ...(fieldData.options?.map((option) => ({
      ...option,
      value: option.value,
      label: option.label,
      category: 'Countries',
    })) || []),
  ];
  return (
    <FormItem
      data-field={field.name}
      className={`RemoteFlows__CountryField__Item__${field.name}`}
    >
      <FormLabel className='RemoteFlows__CountryField__Label'>
        {fieldData.label}
      </FormLabel>
      <FormControl>
        <MultiSelect
          options={countryOptions}
          selected={selected}
          onChange={handleChange}
        />
      </FormControl>
      {fieldData.description && (
        <FormDescription>{fieldData.description}</FormDescription>
      )}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
