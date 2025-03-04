import React from 'react';
import type { Fields } from '@remoteoss/json-schema-form';

type JSONSchemaFormFieldsProps = {
  fields: Fields;
};

const FieldRadio = () => {
  return <p>FieldRadio</p>;
};

const fieldsMapConfig = {
  radio: FieldRadio,
};

export const JSONSchemaFormFields = ({ fields }: JSONSchemaFormFieldsProps) => {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => {
        if (field.isVisible === false || field.deprecated) {
          return null; // Skip hidden or deprecated fields
        }

        const FieldComponent = fieldsMapConfig[field.inputType as string];

        return FieldComponent ? (
          <FieldComponent key={field.name} {...field} />
        ) : (
          <p className="error">
            Field type {field.inputType as string} not supported
          </p>
        );
      })}
    </>
  );
};
