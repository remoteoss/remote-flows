import React from 'react';
import ReactCurrencyInput from 'react-currency-input-field';
import type { CurrencyInputProps as ReactCurrencyInputProps } from 'react-currency-input-field';
import { FormGroup, FormGroupProps } from './FormGroup';

type CurrencyInputProps = Omit<FormGroupProps, 'children'> & {
  locale: string;
  placeholder?: string;
  inputMode: 'decimal' | 'numeric';
  value: string;
  onChange: ReactCurrencyInputProps['onValueChange'];
};

export const CurrencyInput = ({
  label,
  name,
  id,
  description,
  locale,
  placeholder,
  onChange,
  inputMode,
  value,
  ...props
}: CurrencyInputProps) => {
  return (
    <FormGroup label={label} name={name} id={id} description={description}>
      <ReactCurrencyInput
        {...props}
        intlConfig={{ locale }}
        placeholder={(label as string) || placeholder}
        onValueChange={onChange}
        // NOTE: iOS selects the decimal separator for the `decimal` keyboard based on system language.
        // Since we use `en-US` locale this can prevent users from being able to enter floating-point numbers.
        inputMode={inputMode}
        // NOTE: This component uses `Intl.NumberFormat` under the hood which causes
        // rounding errors for very, very large numbers in the UI.
        maxLength={15}
        lang={locale}
        decimalSeparator="."
        groupSeparator=","
        value={value}
      />
    </FormGroup>
  );
};
