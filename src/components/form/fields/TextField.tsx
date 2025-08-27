/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { useFormFields } from '@/src/context';
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
import { Input } from '../../ui/input';

export type TextFieldProps = React.ComponentProps<'input'> & {
  name: string;
} & Partial<
    JSFField & {
      onChange?: (value: any) => void;
      component?: Components['text'];
      includeErrorMessage?: boolean;
      additionalProps?: Record<string, unknown>;
    }
  >;

export function TextField({
  name,
  description,
  label,
  type,
  onChange,
  component,
  includeErrorMessage = true,
  additionalProps = {},
  maxLength,
  ...rest
}: TextFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomTextField = component || components?.text;
        if (CustomTextField) {
          const customTextFieldProps = {
            name,
            description,
            label,
            type,
            onChange,
            metadata: additionalProps,
            maxLength,
            ...rest,
          };
          return (
            <CustomTextField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={customTextFieldProps}
            />
          );
        }

        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__TextField__Item__${name}`}
          >
            {label && (
              <FormLabel className='RemoteFlows__TextField__Label'>
                {label}
              </FormLabel>
            )}
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(event);
                  onChange?.(event);
                }}
                className='RemoteFlows__TextField__Input'
                placeholder={label}
                maxLength={maxLength}
              />
            </FormControl>
            {description && (
              <FormDescription className='RemoteFlows__TextField__Description'>
                {description}
              </FormDescription>
            )}
            {includeErrorMessage && fieldState.error && (
              <FormMessage className='RemoteFlows__TextField__Error' />
            )}
          </FormItem>
        );
      }}
    />
  );
}
