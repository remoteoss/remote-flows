import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { cn } from '@/src/lib/utils';
import * as React from 'react';
import { SupportedTypes } from './types';
import { Components } from '@/src/types/remoteFlows';

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
  label: string;
  name: string;
  description: string;
  fields: Field[];
  components: Components;
};

export function FieldSetField({
  label,
  name,
  fields,
  description,
  components,
}: FieldSetProps) {
  return (
    <fieldset
      className={cn(
        'border-1 border-input p-4 rounded-xl',
        `RemoteFlows__FieldSetField__${name}`,
      )}
    >
      <legend className="text-sm font-semibold px-2">{label}</legend>
      {description ? (
        <div
          className="mb-5 RemoteFlows__FieldSetField__Description"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : null}
      <div className="grid gap-4">
        {fields.map((field) => {
          const FieldComponent = fieldsMap[field.type];
          return (
            <FieldComponent
              {...field}
              key={field.name}
              name={`${name}.${field.name}`}
              component={components?.[field.type]}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
