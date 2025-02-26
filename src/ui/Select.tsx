import React from 'react';
import { Select as SelectRadix } from '@radix-ui/themes';
import { FormGroup } from './FormGroup';
import type { FormGroupProps } from './FormGroup';
import './Select.css';

type SelectItemProps = {
  className?: string;
  value: string;
  children: React.ReactNode;
};

function SelectItem({ className, value, children }: SelectItemProps) {
  return (
    <SelectRadix.Item className={className} value={value}>
      {children}
    </SelectRadix.Item>
  );
}

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
   * Control the dropdown menu visibility. Useful for debugging purposes.
   */
  open?: boolean;

  /**
   * Custom render function for each item in the dropdown menu.
   * Useful when you need to customize the appearance of each item.
   */

  renderItem?: (item: { label: string; value: string }) => React.ReactNode;

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
  open = false,
  renderItem,
}: Props) => {
  const htmlFor = id || name;
  return (
    <FormGroup label={label} name={name} id={id} description={description}>
      <SelectRadix.Root value={value} onValueChange={onChange} open={open}>
        <SelectRadix.Trigger
          id={htmlFor}
          aria-describedby={`${htmlFor}-help-text`}
          className="rmt-SelectTrigger"
        />
        <SelectRadix.Content className="rmt-SelectContent">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectRadix.Content>
      </SelectRadix.Root>
    </FormGroup>
  );
};

Select.Item = SelectItem;
