import React from 'react';
import type { Fields } from '@remoteoss/json-schema-form';
import { RadioField } from '@/src/components/form/fields/RadioField';
import { NumberInputField } from '@/src/components/form/fields/NumberInputField';

type JSONSchemaFormFieldsProps = {
  fields: Fields;
};

const fieldsMapConfig = {
  radio: RadioField,
  number: NumberInputField,
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
