import React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../form';

type RadioFieldItemProps = {
  label: string;
  value: string;
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const RadioFieldItem = ({
  value,
  label,
  name,
  checked,
  onChange,
}: RadioFieldItemProps) => {
  return (
    <FormItem className="flex items-center space-x-3 space-y-0">
      <FormControl>
        <input
          type="radio"
          id={`${name}-${value}`}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
        />
      </FormControl>
      <label
        htmlFor={`${name}-${value}`}
        className="font-normal cursor-pointer"
      >
        {label}
      </label>
    </FormItem>
  );
};

type RadioFieldProps = {
  control: any;
  label: React.ReactNode;
  name: string;
  options: { label: string; value: string }[];
  description?: React.ReactNode;
};

export const RadioField = ({
  control,
  label,
  name,
  options,
  description,
}: RadioFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="space-y-3">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="flex flex-col space-y-1">
                {options.map((option) => (
                  <RadioFieldItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    name={name}
                    checked={field.value === option.value}
                    onChange={field.onChange}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
            {description && <FormDescription>{description}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};
