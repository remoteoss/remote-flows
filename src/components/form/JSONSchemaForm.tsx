/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSFFields } from '@/src/types/remoteFlows';
import React, { Fragment } from 'react';

import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { Statement } from '@/src/components/form/Statement';
import { ForcedValueField } from '@/src/components/form/fields/ForcedValueField';
import { Components, JSFFieldset } from '@/src/types/remoteFlows';
import { getFieldsWithFlatFieldsets } from './utils';
import { StatementComponentProps } from '@/src/types/fields';
import { useFormContext } from 'react-hook-form';

type JSONSchemaFormFieldsProps = {
  fields: JSFFields;
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
  const { setValue } = useFormContext();

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

        if (field.isVisible === false || field.deprecated || field.hidden) {
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
              label={field.label as string}
              helpCenter={field.meta?.helpCenter}
            />
          );
        }

        if (field.Component) {
          const { Component } = field as {
            Component: React.ComponentType<any>;
          };
          return (
            <Fragment key={field.name as string}>
              <Component
                key={field.name as string}
                setValue={(value: unknown) => setValue(field.name, value)}
                {...field}
              />
              {field.statement ? (
                <Statement
                  {...(field.statement as StatementComponentProps['data'])}
                />
              ) : null}
              {field.extra ? field.extra : null}
            </Fragment>
          );
        }

        let FieldComponent =
          fieldsMap[field.inputType as keyof typeof fieldsMap];

        if (!FieldComponent) {
          return (
            <p className='error'>
              Field type {field.inputType as string} not supported
            </p>
          );
        }

        if (field.inputType === 'fieldset') {
          return (
            <FieldComponent
              key={field.name}
              {...field}
              components={components}
            />
          );
        }

        if (field.inputType === 'fieldset-flat') {
          return (
            <FieldComponent
              key={field.name}
              {...field}
              components={components}
              isFlatFieldset
            />
          );
        }

        // TODO: Have doubts about this, it seems we only support checkbox for multiple select
        if (field.inputType === 'select' && field.multiple) {
          FieldComponent = fieldsMap['multi-select'];
        }

        return (
          <Fragment key={field.name as string}>
            <FieldComponent
              {...field}
              component={
                components && components[field.inputType as keyof Components]
              }
            />
            {field.statement ? (
              <Statement
                {...(field.statement as StatementComponentProps['data'])}
              />
            ) : null}
            {field.extra ? field.extra : null}
          </Fragment>
        );
      })}
    </>
  );
};
