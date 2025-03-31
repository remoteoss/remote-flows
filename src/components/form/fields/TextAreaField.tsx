import * as React from 'react';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Textarea } from '../../ui/textarea';
import { cn } from '@/src/lib/utils';

type TextAreaFieldProps = {
  label: string;
  description?: string;
  name: string;
  maxLength?: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function TextAreaField({
  name,
  description,
  label,
  onChange,
  maxLength,
}: TextAreaFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const valueLength = field.value?.length ?? 0;
        return (
          <FormItem className={`RemoteFlows__TextArea__Item__${name}`}>
            <FormLabel className="RemoteFlows__TextArea__Label">
              {label}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ''}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  field.onChange(event);
                  onChange?.(event);
                }}
                className={cn(
                  fieldState.error &&
                    'border-red-500 focus-visible:ring-red-500',
                  'RemoteFlows__TextArea__Input',
                )}
              />
            </FormControl>
            {(description || maxLength) && (
              <div className="flex items-center justify-between">
                {description && (
                  <FormDescription className="RemoteFlows__TextArea__Description">
                    {description}
                  </FormDescription>
                )}
                {maxLength && (
                  <span className="text-sm ml-auto RemoteFlows__TextArea__MaxLength">
                    {valueLength}/{maxLength}
                  </span>
                )}
              </div>
            )}
            {fieldState.error && (
              <FormMessage className="RemoteFlows__TextArea__Error" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
