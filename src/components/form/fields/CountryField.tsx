/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

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

        if (CustomSelectField) {
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
        }

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
          ...options.map((option) => ({
            ...option,
            value: option.value,
            label: option.label,
            category: 'Countries',
          })),
        ];

        const handleChange = (rawValues: any[]) => {
          const values = rawValues.map(({ value }) => value);
          field.onChange(values);
          onChange?.(values);
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
