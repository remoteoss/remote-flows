import React from 'react';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
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
};

const RadioFieldItem = ({ value, label }: RadioFieldItemProps) => {
  return (
    <FormItem className="flex items-center space-x-3 space-y-0">
      <FormControl>
        <RadioGroupItem value={value} />
      </FormControl>
      <FormLabel className="font-normal">{label}</FormLabel>
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
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {options.map((option) => {
                  return (
                    <RadioFieldItem
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
            {description && <FormDescription>{description}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};
