import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

type RadioGroupFieldProps = {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
};

export function RadioGroupField({
  name,
  defaultValue,
  description,
  label,
  options,
}: RadioGroupFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-3 RemoteFlows__RadioGroupField__Item">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center space-x-3 space-y-0 gap-0 RemoteFlows__RadioField__Item"
                >
                  <FormControl>
                    <RadioGroupItem
                      value={option.value}
                      className="RemoteFlows__RadioField__Input"
                    />
                  </FormControl>
                  <FormLabel className="font-normal mb-0 RemoteFlows__RadioField__Label">
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {fieldState.error && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
