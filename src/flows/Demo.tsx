import React, { useState } from 'react';
import { Select } from '../ui/Select';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

export const Demo = () => {
  const [value, setValue] = useState('dragon');
  const options = [
    { label: 'Dragon', value: 'dragon' },
    { label: 'Phoenix', value: 'phoenix' },
    { label: 'Unicorn', value: 'unicorn' },
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
    </Theme>
  );
};
