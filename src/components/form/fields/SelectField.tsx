import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { useFormContext } from 'react-hook-form';

type SelectFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  className?: string;
};

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  description,
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={Boolean(fieldState.error)}>
                  <span className="absolute">
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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
