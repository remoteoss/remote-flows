import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { FormControl, FormField, FormItem, FormMessage } from '../../ui/form';
import { useFormContext } from 'react-hook-form';

type SelectFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  onChange,
  className,
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
    <div className={className}>
      <FormField
        defaultValue={defaultValue}
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  onChange?.(value);
                }}
              >
                <SelectTrigger aria-invalid={Boolean(fieldState.error)}>
                  <span className={'text-foreground'}>
                    <SelectValue placeholder={label} />
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
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
