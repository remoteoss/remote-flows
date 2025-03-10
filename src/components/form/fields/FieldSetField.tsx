import * as React from 'react';
import { RadioGroup } from '@/src/components/ui/radio-group';
import { SupportedTypes } from './types';
import { TextField } from './TextField';
import { SelectField } from './SelectField';

type FieldBase = {
  label: string;
  name: string;
  description: string;
};

type FieldWithOptions = FieldBase & {
  type: 'select' | 'radio';
  options: Array<{ value: string; label: string }>;
};

type FieldWithoutOptions = FieldBase & {
  type: Exclude<SupportedTypes, 'select' | 'radio'>;
  options?: never;
};

type Field = FieldWithOptions | FieldWithoutOptions;

type FieldSetProps = {
  legend: string;
  name: string;
  fields: Field[];
};

const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  text: TextField,
  select: SelectField,
  radio: RadioGroup,
  number: (props) => <TextField {...props} type="text" />,
  fieldset: FieldSetField,
};

export function FieldSetField({ legend, name, fields }: FieldSetProps) {
  return (
    <fieldset className="border-1 border-input p-4 rounded-xl">
      <legend className="text-sm font-semibold px-2">{legend}</legend>
      <div className="grid gap-4">
        {fields.map((field) => {
          const FieldComponent = fieldsMap[field.type];
          return (
            <FieldComponent
              {...field}
              key={field.name}
              name={`${name}.${field.name}`}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
