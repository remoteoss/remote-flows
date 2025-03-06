import { fieldsMapConfig } from '@/src/components/form/fields/fieldsMapping';
import React from 'react';

type Props = {
  name: string;
  label: string;
  description?: React.ReactNode;
  fields: any[];
};

export function FieldsetField({ name, label, description, fields }: Props) {
  return (
    <fieldset className="fieldset">
      <legend>{label}</legend>
      {description}

      {fields.map((field) => {
        if (field.isVisible === false) {
          return null;
        }

        const FieldComponent = fieldsMapConfig[field.type];
        return FieldComponent ? (
          <FieldComponent
            key={field.name}
            {...field}
            name={`${name}.${field.name}`}
          />
        ) : (
          <p className="error">Field type {field.type} not supported</p>
        );
      })}
    </fieldset>
  );
}
