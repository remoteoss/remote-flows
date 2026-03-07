import { useEffect, useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { MultiSelect, type Option } from '../ui/multi-select';
import { CountryComponentProps } from '@remoteoss/remote-flows';

export function CountryFieldDefault({
  field,
  fieldState,
  fieldData,
}: CountryComponentProps) {
  const [selected, setSelected] = useState<Option[]>([]);

  useEffect(() => {
    if (field.value && fieldData.options) {
      setSelected(
        field.value.map(
          (value: string) =>
            fieldData?.options?.find(
              (option) => option.value === value,
            ) as Option,
        ),
      );
    }
  }, [field.value, fieldData.options]);

  const handleChange = (rawValues: Option[]) => {
    const values = rawValues.map(({ value }) => value);
    field.onChange(values);
    setSelected(rawValues);
  };

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
