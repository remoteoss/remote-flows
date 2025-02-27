import React from 'react';
import type { SelectProps, Option } from './Select';
import { Select } from './Select';
import { FlagIcon } from './FlagIcon';
import { Flex } from '@radix-ui/themes';

function CustomOption({ label, ...props }: Option) {
  return (
    <Select.Item {...props}>
      <Flex gap={'2'}>
        <FlagIcon name={label} />
        {label}
      </Flex>
    </Select.Item>
  );
}

type SelectCountriesProps = Omit<SelectProps, 'components'>;

export const SelectCountries = ({
  value,
  onChange,
  options,
  description,
  name,
  label,
  ...props
}: SelectCountriesProps) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      description={description}
      name={name}
      label={label}
      components={{
        Option: CustomOption,
      }}
      {...props}
    />
  );
};
