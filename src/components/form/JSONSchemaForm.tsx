/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment } from 'react';
import { useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { Statement } from '@/src/components/form/Statement';
import { ForcedValueField } from '@/src/components/form/fields/ForcedValueField';
import { Components, JSFFieldset, JSFFields } from '@/src/types/remoteFlows';
import { StatementComponentProps } from '@/src/types/fields';
import { checkFieldHasForcedValue, getFieldsWithFlatFieldsets } from './utils';

type JSONSchemaFormFieldsProps = {
  fields: JSFFields;
  components?: Components;
  fieldsets?: JSFFieldset | null | undefined;
  fieldValues?: Record<string, unknown>;
};

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
      return (
        <field.WrapperComponent key={key}>{content}</field.WrapperComponent>
      );
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

        const isForcedValue = checkFieldHasForcedValue(field);

        if (isForcedValue) {
          const fieldProps = omit(field, 'WrapperComponent');
          return wrapWithCustomWrapper(
            <ForcedValueField
              name={fieldProps.name as string}
              description={fieldProps.description as string}
              value={fieldProps.const as string}
              statement={fieldProps.statement as any}
              label={fieldProps.label as string}
              helpCenter={fieldProps.meta?.helpCenter}
            />,
            field,
            field.name as string,
          );
        }

        if (field.Component) {
          const { Component } = field as any;
          const fieldProps = omit(field, ['Component', 'WrapperComponent']);
          return wrapWithCustomWrapper(
            <>
              <Component
                setValue={(value: unknown) => setValue(field.name, value)}
                {...fieldProps}
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
          const fieldProps = omit(field, 'WrapperComponent');
          return wrapWithCustomWrapper(
            <FieldComponent {...fieldProps} components={components} />,
            field,
            field.name,
          );
        }

        if (fieldType === 'fieldset-flat') {
          const fieldProps = omit(field, 'WrapperComponent');
          return wrapWithCustomWrapper(
            <FieldComponent
              {...fieldProps}
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

        const fieldProps = omit(field, 'WrapperComponent');
        return wrapWithCustomWrapper(
          <>
            <FieldComponent
              {...fieldProps}
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
