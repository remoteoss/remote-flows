/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fields } from '@remoteoss/json-schema-form';
import React, { Fragment } from 'react';

import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { Statement, StatementProps } from '@/src/components/form/Statement';
import { ForcedValueField } from '@/src/components/form/fields/ForcedValueField';
import { Components, JSFFieldset } from '@/src/types/remoteFlows';
import { getFieldsWithFlatFieldsets } from './utils';

type JSONSchemaFormFieldsProps = {
  fields: Fields;
  components?: Components;
  fieldsets?: JSFFieldset | null | undefined;
  fieldValues?: Record<string, unknown>;
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
  fieldsets,
  fieldValues,
  components,
}: JSONSchemaFormFieldsProps) => {
  if (!fields || fields.length === 0) return null;

  const maybeFieldWithFlatFieldsets =
    fieldsets && fieldValues
      ? getFieldsWithFlatFieldsets({
          fields: fields,
          fieldsets: fieldsets,
          values: fieldValues,
        })
      : fields;

  return (
    <>
      {maybeFieldWithFlatFieldsets.map((field) => {
        if (field.calculateDynamicProperties) {
          field = {
            ...field,
            ...(field.calculateDynamicProperties(fieldValues, field) || {}),
          };
        }

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

        if (field.Component) {
          const { Component } = field as {
            Component: React.ComponentType<any>;
          };
          return <Component key={field.name as string} {...field} />;
        }

        let FieldComponent = fieldsMap[field.inputType as SupportedTypes];

        if (field.inputType === 'select' && field.multiple) {
          FieldComponent = fieldsMap['multi-select'];
        }

        if (field.inputType === 'fieldset') {
          return <FieldComponent {...field} components={components} />;
        }

        if (field.inputType === 'fieldset-flat') {
          return (
            <FieldComponent {...field} components={components} isFlatFieldset />
          );
        }

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
            {field.extra ? field.extra : null}
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
