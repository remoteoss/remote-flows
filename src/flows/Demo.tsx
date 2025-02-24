import React, { useState } from 'react';
import { Select } from '../ui/Select';
import { Key } from 'react-aria-components';

export const Demo = () => {
  const [animal, setAnimal] = useState<Key>('');
  const options = [
    {
      id: 1,
      name: 'Dragon',
    },
    {
      id: 2,
      name: 'Tiger',
    },
    {
      id: 3,
      name: 'Lion',
    },
  ];

  return (
    <>
      <Select
        label="Select an animal"
        selectedKey={animal}
        onSelectionChange={(selected) => setAnimal(selected)}
        items={options}
      >
        {(item) => <Select.Item key={item.id}>{item.name}</Select.Item>}
      </Select>
      {animal}
    </>
  );
};
