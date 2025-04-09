/* eslint-disable @typescript-eslint/no-explicit-any */
import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { Fields } from '@remoteoss/json-schema-form';
import React, { Fragment } from 'react';
import { Statement, StatementProps } from './Statement';
import { ForcedValueField } from './fields/ForcedValueField';

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
            <ForcedValueField
              key={field.name as string}
              name={field.name as string}
              description={field.description as string}
              value={field.const as string}
              statement={field.statement as any}
            />
          );
        }

        const FieldComponent = fieldsMap[field.inputType as SupportedTypes];
        return FieldComponent ? (
          <Fragment key={field.name as string}>
            <FieldComponent {...field} />
            {field.statement ? (
              <Statement {...(field.statement as StatementProps)} />
            ) : null}
          </Fragment>
        ) : (
          <p className="error">
            Field type {field.inputType as string} not supported
          </p>
        );
      })}
    </>
  );
};
