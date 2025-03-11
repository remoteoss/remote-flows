import * as React from 'react';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { useFormContext } from 'react-hook-form';

type TextFieldProps = React.ComponentProps<'input'> & {
  label: string;
  description?: string;
  name: string;
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

export function TextField({ name, description, label, type }: TextFieldProps) {
  const { control } = useFormContext();
  const isTypeNumber = type === 'number';
  const typeAttrs = isTypeNumber ? inputModeAttrs : { type };
  return (
    <div className="TextField__Wrapper">
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className="TextField__Item">
            <FormLabel className="TextField__Label">{label}</FormLabel>
            <FormControl>
              <Input {...field} {...typeAttrs} className="TextField__Input" />
            </FormControl>
            {description && (
              <FormDescription className="TextField__Description">
                {description}
              </FormDescription>
            )}
            {fieldState.error && <FormMessage className="TextField__Error" />}
          </FormItem>
        )}
      />
    </div>
  );
}
