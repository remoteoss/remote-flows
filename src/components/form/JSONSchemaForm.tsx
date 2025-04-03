/* eslint-disable @typescript-eslint/no-explicit-any */
import { fieldsMap } from '@/src/components/form/fields/fieldsMapping';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { Fields } from '@remoteoss/json-schema-form';
import React, { Fragment, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Statement, StatementProps } from './Statement';

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

function ForcedValueField({ field }: { field: Fields[number] }) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue(field.name as string, field.const);
  }, []);

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

export const JSONSchemaFormFields = ({ fields }: JSONSchemaFormFieldsProps) => {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => {
        if (field.isVisible === false || field.deprecated) {
          return null; // Skip hidden or deprecated fields
        }

        if (checkFieldHasForcedValue(field)) {
          return <ForcedValueField key={field.name as string} field={field} />;
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
