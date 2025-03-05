import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/src/components/form';
import { Input } from '@/src/components/input';
import { cn } from '@/src/lib/utils';

// TODO: use the form context later
type Props = {
  control: any;
  name: string;
  label: string;
};

export const NumberInputField = ({ control, name, label }: Props) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              placeholder={label} // TODO: does json-schema-form support placeholders?
              {...field}
              value={field.value === undefined ? '' : field.value}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(
                  value === '' ? undefined : Number.parseFloat(value),
                );
              }}
              className={cn(
                'border-2',
                /* form.formState.errors.salary // TODO: treat errors later
                  ? 'border-red-500'
                  : 'border-gray-200', */
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
