import { useEffect, useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { MultiSelect, type Option } from '../ui/multi-select';
import { FieldComponentProps } from '@remoteoss/remote-flows';

export function MultiSelectFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const [selected, setSelected] = useState<Option[]>([]);

  useEffect(() => {
    setSelected(
      fieldData.options?.filter((option) =>
        field.value?.includes(option.value),
      ) || [],
    );
  }, [field.value, fieldData.options]);

  const { name, label, description, options } = fieldData;
  const selectedOptions =
    selected ||
    options?.filter((option) => field.value?.includes(option.value));

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__SelectField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__SelectField__Label'>{label}</FormLabel>
      <FormControl>
        <MultiSelect
          options={options || []}
          selected={selectedOptions}
          onChange={(rawValues: Option[]) => {
            const values = rawValues.map(({ value }) => value);
            field.onChange(values);
            setSelected(rawValues);
          }}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {fieldState.error && <FormMessage />}
    </FormItem>
  );
}
