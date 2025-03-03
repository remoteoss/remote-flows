import React from 'react';
import { Select } from '../components/Select';
export const Demo = () => {
  const [value, setValue] = React.useState('');

  return (
    <div>
      <Select
        onChange={(newValue) => setValue(newValue)}
        value={value}
        items={[
          { id: '1', name: 'One' },
          { id: '2', name: 'Two' },
        ]}
      />
    </div>
  );
};
