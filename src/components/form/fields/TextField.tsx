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

type TextFieldProps = {
  name: string;
  className?: string;
  label: string;
  description?: string;
  type?: React.ComponentProps<'input'>['type'];
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
        render={({ field }) => (
          <FormItem className="TextField__Item">
            <FormLabel className="TextField__Label">{label}</FormLabel>
            <FormControl>
              <Input {...field} {...typeAttrs} className="TextField__Input" />
            </FormControl>
            <FormDescription className="TextField__Description">
              {description}
            </FormDescription>
            <FormMessage className="TextField__Error" />
          </FormItem>
        )}
      />
    </div>
  );
}
