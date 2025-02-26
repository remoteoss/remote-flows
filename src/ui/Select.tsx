import React from 'react';
import { Select as SelectRadix } from '@radix-ui/themes';
import { FormGroup } from './FormGroup';
import type { FormGroupProps } from './FormGroup';
import './Select.css';

type Props = Omit<FormGroupProps, 'children'> & {
  /**
   * Value to control the current selected option.
   */
  value: string;
  /**
   * Options to be displayed in the dropdown menu.
   */
  options: { label: string; value: string }[];

  /**
   * Callback function that is called when the current value changes.
   */
  onChange: (value: string) => void;
};

export const Select = ({
  value,
  onChange,
  options,
  description,
  name,
  id,
  label,
}: Props) => {
  const htmlFor = id || name;
  return (
    <FormGroup label={label} name={name} id={id} description={description}>
      <SelectRadix.Root value={value} onValueChange={onChange}>
        <SelectRadix.Trigger
          id={htmlFor}
          aria-describedby={`${htmlFor}-help-text`}
          className="rmt-SelectTrigger"
        />
        <SelectRadix.Content className="rmt-SelectContent">
          {options.map((option) => (
            <SelectRadix.Item
              className="rmt-SelectItem"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectRadix.Item>
          ))}
        </SelectRadix.Content>
      </SelectRadix.Root>
    </FormGroup>
  );
};
