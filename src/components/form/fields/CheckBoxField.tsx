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

type CheckboxFieldProps = {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
};

export function CheckboxField({
  name,
  defaultValue,
  description,
  label,
}: CheckboxFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            'space-y-3',
            `RemoteFlows__CheckboxField__Item__${name}`,
          )}
        >
          <FormControl>
            <div className="flex space-x-2">
              <Checkbox id={name} {...field} />
              <FormLabel>{label}</FormLabel>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {fieldState.error && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
