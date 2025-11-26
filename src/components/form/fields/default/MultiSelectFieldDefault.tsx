import { useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { MultiSelect, Option } from '@/src/components/ui/multi-select';
import { $TSFixMe, FieldComponentProps } from '@/src/types/remoteFlows';

export function MultiSelectFieldDefault({
  field,
  fieldState,
  fieldData,
}: FieldComponentProps) {
  const { name, label, description, options } = fieldData as $TSFixMe;
  const [selected, setSelected] = useState<$TSFixMe[]>();

  const selectedOptions =
    selected ||
    options?.filter((option: $TSFixMe) =>
      field.value?.includes(option.value),
    ) ||
    [];

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__SelectField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__SelectField__Label'>{label}</FormLabel>
      <FormControl>
        <MultiSelect
          options={options as Option[]}
          selected={selectedOptions}
          onChange={(rawValues: $TSFixMe[]) => {
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
