import { Checkbox } from '@/src/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { cn } from '@/src/lib/utils';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

type CheckBoxFieldProps = {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
};

export function CheckBoxField({
  name,
  defaultValue,
  description,
  label,
}: CheckBoxFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        return (
          <FormItem className={cn(`RemoteFlows__CheckboxField__Item__${name}`)}>
            <FormControl>
              <div className="flex space-x-2">
                <Checkbox
                  id={name}
                  onCheckedChange={field.onChange}
                  checked={field.value}
                />
                <FormLabel htmlFor={name} className="mb-0">
                  {label}
                </FormLabel>
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
