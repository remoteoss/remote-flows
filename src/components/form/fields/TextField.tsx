import * as React from 'react';

import { useFormFields } from '@/src/context';
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
  label: string;
  description?: string;
  name: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
};

export function TextField({
  name,
  description,
  label,
  type,
  onChange,
  ...rest
}: TextFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        if (components?.text) {
          const CustomTextField = components?.text;
          const customTextFieldProps = {
            name,
            description,
            label,
            type,
            onChange,
            ...rest,
          };
          return (
            <CustomTextField
              field={field}
              fieldState={fieldState}
              fieldData={customTextFieldProps}
            />
          );
        }

        return (
          <FormItem className={`RemoteFlows__TextField__Item__${name}`}>
            <FormLabel className="RemoteFlows__TextField__Label">
              {label}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                // {...rest}
                value={field.value ?? ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(event);
                  onChange?.(event);
                }}
                className="RemoteFlows__TextField__Input"
                placeholder={label}
              />
            </FormControl>
            {description && (
              <FormDescription className="RemoteFlows__TextField__Description">
                {description}
              </FormDescription>
            )}
            {fieldState.error && (
              <FormMessage className="RemoteFlows__TextField__Error" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
