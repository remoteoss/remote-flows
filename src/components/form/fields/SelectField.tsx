import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
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
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="SelectField__Item">
          <FormLabel className="SelectField__Label">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Select
                value={field.value}
                onValueChange={(value: string) => {
                  field.onChange(value);
                  onChange?.(value);
                }}
              >
                <SelectTrigger
                  className="SelectField__Trigger"
                  aria-invalid={Boolean(fieldState.error)}
                >
                  <span className="absolute">
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent className="SelectField__Content">
                  <SelectGroup className="SelectField__Group">
                    {options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="SelectField__SelectItem"
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
      )}
    />
  );
}
