import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { cn } from '@/src/lib/utils';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

type RadioGroupFieldProps = {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  onChange?: (value: string) => void;
};

export function RadioGroupField({
  name,
  defaultValue,
  description,
  label,
  options,
  onChange,
}: RadioGroupFieldProps) {
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
            `RemoteFlows__RadioGroupField__Item__${name}`,
          )}
        >
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value: string) => {
                field.onChange(value);
                onChange?.(value);
              }}
              value={field.value}
              className="flex flex-col space-y-3"
            >
              {options.map((option) => (
                <>
                  <FormItem
                    key={option.value}
                    className="flex items-start space-x-3 space-y-0 gap-0 RemoteFlows__RadioField__Item"
                  >
                    <FormControl>
                      <RadioGroupItem
                        value={option.value}
                        className="RemoteFlows__RadioField__Input"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="font-normal mb-0 RemoteFlows__RadioField__Label">
                        {option.label}
                      </FormLabel>
                      {option.description && (
                        <FormDescription className="mt-2">
                          {option.description}
                        </FormDescription>
                      )}
                    </div>
                  </FormItem>
                </>
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
