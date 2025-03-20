import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { cn } from '@/src/lib/utils';
import * as React from 'react';
import { SupportedTypes } from './types';

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

export function FieldSetField({ legend, name, fields }: FieldSetProps) {
  return (
    <fieldset
      className={cn(
        'border-1 border-input p-4 rounded-xl',
        `RemoteFlows__FieldSetField__${name}`,
      )}
    >
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
