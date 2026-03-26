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
    field.type !== 'checkbox' && // Because checkbox must always be visible
    field.type !== 'hidden' // Because hidden inputs shouldn't be visible
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

  const wrapWithCustomWrapper = (
    content: React.ReactNode,
    field: any,
    key: string,
  ) => {
    if (field.WrapperComponent) {
      return <field.WrapperComponent key={key}>{content}</field.WrapperComponent>;
    }
    return <Fragment key={key}>{content}</Fragment>;
  };

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
          return wrapWithCustomWrapper(
            <ForcedValueField
              name={field.name as string}
              description={field.description as string}
              value={field.const as string}
              statement={field.statement as any}
              label={field.label as string}
              helpCenter={field.meta?.helpCenter}
            />,
            field,
            field.name as string,
          );
        }

        if (field.Component) {
          const { Component } = field as {
            Component: React.ComponentType<any>;
          };
          return wrapWithCustomWrapper(
            <>
              <Component
                setValue={(value: unknown) => setValue(field.name, value)}
                {...field}
              />
              {field.statement ? (
                <Statement
                  {...(field.statement as StatementComponentProps['data'])}
                />
              ) : null}
              {field.extra ? field.extra : null}
            </>,
            field,
            field.name as string,
          );
        }

        // We use field.type on purpose here, not field.inputType, when using field.inputType
        // the conditionals didn't work as expected
        // I believe json-schema-form in the latest versions uses field.inputType correctly but
        // the version of json-schema-form is decided by remote-json-schema-form-kit
        // our product uses field.type instead of field.inputType and we probably should do the same
        const fieldType = field.type;
        let FieldComponent = fieldsMap[fieldType as keyof typeof fieldsMap];

        if (!FieldComponent) {
          return (
            <p className='error'>
              Field type {fieldType as string} not supported
            </p>
          );
        }

        if (fieldType === 'fieldset') {
          return wrapWithCustomWrapper(
            <FieldComponent
              {...field}
              components={components}
            />,
            field,
            field.name,
          );
        }

        if (fieldType === 'fieldset-flat') {
          return wrapWithCustomWrapper(
            <FieldComponent
              {...field}
              components={components}
              isFlatFieldset
            />,
            field,
            field.name,
          );
        }

        // TODO: Have doubts about this, it seems we only support checkbox for multiple select
        if (fieldType === 'select' && field.multiple) {
          FieldComponent = fieldsMap['multi-select'];
        }

        return wrapWithCustomWrapper(
          <>
            <FieldComponent
              {...field}
              component={
                components && components[fieldType as keyof Components]
              }
            />
            {field.statement ? (
              <Statement
                {...(field.statement as StatementComponentProps['data'])}
              />
            ) : null}
            {field.extra ? field.extra : null}
          </>,
          field,
          field.name as string,
        );
      })}
    </>
  );
};
