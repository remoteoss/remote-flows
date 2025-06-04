/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { Components, JSFField } from '@/src/types/remoteFlows';
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

export type TextAreaFieldProps = JSFField & {
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  component?: Components['textarea'];
};

export function TextAreaField({
  name,
  description,
  label,
  onChange,
  maxLength,
  component,
  ...rest
}: TextAreaFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomTextAreaField = component || components?.textarea;
        if (CustomTextAreaField) {
          const customTextAreaFieldProps = {
            name,
            description,
            label,
            maxLength,
            ...rest,
          };
          return (
            <CustomTextAreaField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={customTextAreaFieldProps}
            />
          );
        }

        const valueLength = field.value?.length ?? 0;
        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__TextArea__Item__${name}`}
          >
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
                placeholder={''}
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
