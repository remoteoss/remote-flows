import React, { useState } from 'react';
import { Select } from '../ui/Select';

export const Demo = () => {
  const [animal, setAnimal] = useState<string>('');
  const options = [
    {
      id: '1',
      name: 'Dragon',
    },
    {
      id: '2',
      name: 'Tiger',
    },
    {
      id: '3',
      name: 'Lion',
    },
  ];

  return (
    <>
      <Select
        label="Select animal"
        value={animal}
        onChange={(value) => setAnimal(value)}
        options={options}
      ></Select>
      {animal}
    </>
  );
};
