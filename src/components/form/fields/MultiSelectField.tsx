/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { MultiSelect } from '../../ui/multi-select';
import { useState } from 'react';

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
        if (CustomSelectField) {
          const customSelectFieldProps = {
            label,
            name,
            options,
            defaultValue,
            description,
            onChange,
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
        }

        const selectedOptions =
          selected ||
          options.filter((option) => field.value.includes(option.value));

        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__SelectField__Item__${name}`}
          >
            <FormLabel className='RemoteFlows__SelectField__Label'>
              {label}
            </FormLabel>
            <FormControl>
              <MultiSelect
                options={options}
                selected={selectedOptions}
                onChange={(rawValues: any[]) => {
                  const values = rawValues.map(({ value }) => value);
                  field.onChange(values);
                  onChange?.(values);
                  setSelected(rawValues);
                }}
                {...rest}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
