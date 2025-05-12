/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { useFormFields } from '@/src/context';
import { JSFField } from '@/src/types/remoteFlows';
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
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (value: any) => void;
  $meta: {
    regions: Record<string, string[]>;
    subregions: Record<string, string[]>;
  };
};

export function CountryField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  $meta,
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
        if (components?.select) {
          const CustomSelectField = components?.select;
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

        const handleChange = (value: any) => {
          field.onChange(value);
          onChange?.(value);
        };

        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__SelectField__Item__${name}`}
          >
            <FormLabel className="RemoteFlows__SelectField__Label">
              {label}
            </FormLabel>
            <FormControl>
              <MultiSelect
                options={countryOptions}
                selected={field.value || []}
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
