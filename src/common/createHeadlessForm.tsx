import { FieldValues } from 'react-hook-form';
import {
  createHeadlessForm as baseCreateHeadlessForm,
  FormResult,
  modify,
} from '@remoteoss/remote-json-schema-form-kit';
import { convertToCents } from '@/src/components/form/utils';
import { JSFModify } from '@/src/flows/types';
import { findFieldsByType } from '@/src/flows/utils';
import { JSFFieldset } from '@/src/types/remoteFlows';

type CreateHeadlessFormResult = FormResult & {
  meta: {
    'x-jsf-fieldsets': JSFFieldset;
  };
};

/*
 * Creates a headless form from a JSON Schema, useful to avoid code duplication when creating headless forms.
 * @param jsfSchema - The JSON Schema
 * @param fieldValues - The field values
 * @param options - The options
 * @returns The headless form
 */
export const createHeadlessForm = (
  jsfSchema: Record<string, unknown>,
  fieldValues?: FieldValues,
  options?: { jsfModify?: JSFModify },
): CreateHeadlessFormResult => {
  if (options && options.jsfModify) {
    const { schema } = modify(jsfSchema, options.jsfModify);
    jsfSchema = schema;
  }

  let moneyFieldsData: Record<string, number | null> = {};

  if (fieldValues) {
    const moneyFields = findFieldsByType(jsfSchema.properties || {}, 'money');
    moneyFieldsData = moneyFields.reduce<Record<string, number | null>>(
      (acc, field) => {
        acc[field] = convertToCents(fieldValues[field]);
        return acc;
      },
      {},
    );
  }

  /**
   * We create a deep copy of the field values to avoid modifying the original object.
   * This problem is caused by json-schema-form-v0.
   */
  const initialValues = JSON.parse(
    JSON.stringify({
      ...fieldValues,
      ...moneyFieldsData,
    }),
  );

  return {
    meta: {
      'x-jsf-fieldsets': jsfSchema['x-jsf-fieldsets'] as JSFFieldset,
    },
    ...baseCreateHeadlessForm(jsfSchema, {
      initialValues,
    }),
  };
};
