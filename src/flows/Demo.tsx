import React, { useState } from 'react';
import { Select } from '../ui/Select';
import { Theme } from '@radix-ui/themes';
import { SelectCountries } from '../ui/SelectCountries';
import { SVGSprite } from '../ui/SVGSprite';
import { CurrencyInput } from '../ui/CurrencyInput';
import '@radix-ui/themes/styles.css';

export const Demo = () => {
  const [value, setValue] = useState('dragon');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
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

  const onChangeSalary = (value?: string) => {
    setAnnualSalary(value || '');
  };

  return (
    <Theme>
      <SVGSprite />
      <Select
        value={value}
        onChange={(value) => setValue(value)}
        options={options}
        description="Your spirit animal"
        name="spirit-animal"
        label="Select your animal"
      />
      <SelectCountries
        value={selectedCountry}
        onChange={(value) => setSelectedCountry(value)}
        options={optionsCountries}
        description="Your employment country"
        placeholder="Select your country..."
        name="spirit-animal"
        label="Select your country"
      />

      <CurrencyInput
        value={annualSalary}
        label="Employee's annual salary"
        name="salary"
        locale={'US-en'}
        inputMode={'decimal'}
        onChange={onChangeSalary}
      />
    </Theme>
  );
};
