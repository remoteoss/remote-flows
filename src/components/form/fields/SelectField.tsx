import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SelectField({
  label,
  options,
  defaultValue,
  onChange,
  className,
}: SelectFieldProps) {
  const [value, setValue] = React.useState(defaultValue || '');

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  // @TODO: wrap with shadcn FormField component
  return (
    <div className={className}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger>
          <span className="text-primary">
            <SelectValue placeholder={label} />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
