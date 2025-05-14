/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fields } from '@remoteoss/json-schema-form';
import React, { Fragment } from 'react';

import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { Statement, StatementProps } from '@/src/components/form/Statement';
import { ForcedValueField } from '@/src/components/form/fields/ForcedValueField';
import { Components } from '@/src/types/remoteFlows';

type JSONSchemaFormFieldsProps = {
  fields: Fields;
  components?: Components;
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

export const JSONSchemaFormFields = ({
  fields,
  components,
}: JSONSchemaFormFieldsProps) => {
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
            <FieldComponent
              {...field}
              component={
                components && components[field.inputType as SupportedTypes]
              }
            />
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
