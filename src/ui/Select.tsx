import React, { ReactNode } from 'react';
import { Select as SelectRadix } from '@radix-ui/themes';
import { FormGroup } from './FormGroup';
import type { FormGroupProps } from './FormGroup';
import './Select.css';

type SelectItemProps = {
  /**
   * Value of the option.
   */
  value: string;
  /**
   * The content of the option.
   */
  children: React.ReactNode;
};

function SelectItem({ value, children }: SelectItemProps) {
  return (
    <SelectRadix.Item className="rmt-SelectItem" value={value}>
      {children}
    </SelectRadix.Item>
  );
}

export type Option = {
  /**
   * The label of the option.
   */
  label: string;
  /**
   * The value of the option.
   */
  value: string;
};

type Props = Omit<FormGroupProps, 'children'> & {
  /**
   * Value to control the current selected option.
   */
  value: string;
  /**
   * Options to be displayed in the dropdown menu.
   */
  options: Option[];

  /**
   * Whether the dropdown menu is open. Useful for debugging purposes.
   */
  open?: boolean;

  /**
   * Placeholder to be displayed when no option is selected. When it's not used we default to label.
   */
  placeholder?: ReactNode;

  /**
   * Custom components to be used in the Select component.
   */
  components?: {
    Option?: React.ComponentType<Option> | null;
  };

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
  open,
  placeholder,
  components = { Option: null },
}: Props) => {
  const htmlFor = id || name;
  const addOpenProp = open ? { open: true } : {};
  return (
    <FormGroup label={label} name={name} id={id} description={description}>
      <SelectRadix.Root value={value} onValueChange={onChange} {...addOpenProp}>
        <SelectRadix.Trigger
          id={htmlFor}
          aria-describedby={`${htmlFor}-help-text`}
          className="rmt-SelectTrigger"
          // SelectRadix.Trigger placeholder only accepts "string" type but internally it accepts ReactNode
          placeholder={(placeholder as string) || (label as string)}
        />
        <SelectRadix.Content className="rmt-SelectContent">
          {options.map((option) =>
            components?.Option ? (
              <components.Option key={option.value} {...option} />
            ) : (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ),
          )}
        </SelectRadix.Content>
      </SelectRadix.Root>
    </FormGroup>
  );
};

Select.Item = SelectItem;
