import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { Fields } from '@remoteoss/json-schema-form';
import React from 'react';

type JSONSchemaFormFieldsProps = {
  fields: Fields;
};

function checkFieldHasForcedValue(field: any) {
  // A field to be considered "forced value" must:
  return (
    field.const !== undefined && // Only accepts a specific value
    field.const === field.default && // It can be prefilled, meaning it's not critical
    field.inputType !== 'checkbox' && // Because checkbox must always be visible
    field.inputType !== 'hidden' // Because hidden inputs shouldn't be visible
  );
}

export const JSONSchemaFormFields = ({ fields }: JSONSchemaFormFieldsProps) => {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => {
        if (field.isVisible === false || field.deprecated) {
          return null; // Skip hidden or deprecated fields
        }

        if (checkFieldHasForcedValue(field)) {
          return (
            <div>
              <p
                className="mb-5 RemoteFlows__Statement"
                // @ts-expect-error error
                dangerouslySetInnerHTML={{ __html: field.statement?.title }}
              />
              <p
                className="RemoteFlows__Statement"
                dangerouslySetInnerHTML={{
                  // @ts-expect-error error
                  __html: field.statement?.description || field.description,
                }}
              />
            </div>
          );
        }

        const FieldComponent = fieldsMap[field.inputType as SupportedTypes];
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
