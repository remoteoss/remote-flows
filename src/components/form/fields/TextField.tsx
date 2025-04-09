import * as React from 'react';

import { useFormFields } from '@/src/RemoteFlowsProvider';
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

type TextFieldProps = React.ComponentProps<'input'> & {
  label: string;
  description?: string;
  name: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
};

type InputModeAttrsProps = Pick<
  React.ComponentProps<'input'>,
  'type' | 'inputMode' | 'pattern'
>;

const inputModeAttrs: InputModeAttrsProps = {
  type: 'text',
  inputMode: 'decimal',
  pattern: '^[0-9.]*$',
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
  const isTypeNumber = type === 'number';
  const typeAttrs = isTypeNumber ? inputModeAttrs : { type };

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
            <CustomTextField field={field} metadata={customTextFieldProps} />
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
                value={field.value ?? ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(event);
                  onChange?.(event);
                }}
                {...typeAttrs}
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
