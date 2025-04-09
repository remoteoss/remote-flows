import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { useFormFields } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';

type SelectFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
};

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  ...rest
}: SelectFieldProps) {
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
            ...rest,
          };
          return (
            <CustomSelectField
              field={field}
              fieldState={fieldState}
              fieldData={customSelectFieldProps}
            />
          );
        }

        return (
          <FormItem className={`RemoteFlows__SelectField__Item__${name}`}>
            <FormLabel className="RemoteFlows__SelectField__Label">
              {label}
            </FormLabel>
            <FormControl aria-label={label}>
              <div className="relative">
                <Select
                  value={field.value || ''}
                  onValueChange={(value: string) => {
                    field.onChange(value);
                    onChange?.(value);
                  }}
                >
                  <SelectTrigger
                    className="RemoteFlows__SelectField__Trigger"
                    aria-invalid={Boolean(fieldState.error)}
                  >
                    <span className="absolute">
                      <SelectValue placeholder={label} />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="RemoteFlows__SelectField__Content">
                    <SelectGroup className="RemoteFlows__SelectField__Group">
                      {options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="RemoteFlows__SelectField__SelectItem"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
