import React, { useState } from 'react';
import type { Option } from '../ui/Select';
import { Select } from '../ui/Select';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

function CustomOption({ label, ...props }: Option) {
  return <Select.Item {...props}>{label}</Select.Item>;
}

export const Demo = () => {
  const [value, setValue] = useState('dragon');
  const [selectedCountry, setSelectedCountry] = useState('');
  const options = [
    { label: 'Dragon', value: 'dragon' },
    { label: 'Phoenix', value: 'phoenix' },
    { label: 'Unicorn', value: 'unicorn' },
  ];

  const optionsCountries = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'Mexico', value: 'mx' },
  ];

  return (
    <Theme>
      <Select
        value={value}
        onChange={(value) => setValue(value)}
        options={options}
        description="Your spirit animal"
        name="spirit-animal"
        label="Select your animal"
      />

      <Select
        value={selectedCountry}
        onChange={(value) => setSelectedCountry(value)}
        options={optionsCountries}
        description="Your employment country"
        name="spirit-animal"
        label="Select your country"
        components={{
          Option: CustomOption,
        }}
      />
    </Theme>
  );
};
