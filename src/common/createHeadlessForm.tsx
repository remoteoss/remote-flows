import { FieldValues } from 'react-hook-form';
import {
  createHeadlessForm as baseCreateHeadlessForm,
  modify,
} from '@remoteoss/remote-json-schema-form-kit';
import { convertToCents } from '@/src/components/form/utils';
import {
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
} from '@/src/flows/types';
import { findFieldsByType } from '@/src/flows/utils';
import { JSFFieldset } from '@/src/types/remoteFlows';

/**
 * Extracts money fields that have default values (which are already in cents)
 */
function extractMoneyDefaults(schema: Record<string, unknown>): {
  fieldsWithDefaults: Set<string>;
} {
  const properties = ((schema as { properties?: Record<string, unknown> })
    ?.properties ?? {}) as Record<string, unknown>;
  const fieldsWithDefaults = new Set<string>();

  Object.entries(properties).forEach(([key, prop]) => {
    const propObj = prop as Record<string, unknown>;
    const presentation = propObj?.['x-jsf-presentation'] as
      | Record<string, unknown>
      | undefined;
    const isMoney = presentation?.inputType === 'money';
    if (isMoney && propObj?.default !== undefined) {
      fieldsWithDefaults.add(key);
    }
  });

  return { fieldsWithDefaults };
}

/**
 * Gets the default value for a field from the schema
 */
function getFieldDefault(
  schema: Record<string, unknown>,
  fieldName: string,
): unknown {
  const properties = ((schema as { properties?: Record<string, unknown> })
    ?.properties ?? {}) as Record<string, unknown>;
  const field = properties[fieldName] as Record<string, unknown> | undefined;
  return field?.default;
}

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
): JSONSchemaFormResultWithFieldsets => {
  if (options && options.jsfModify) {
    const { required, allOf, ...modifyConfig } = options.jsfModify;
    // muteLogging: true suppresses the generic library log; we surface the
    // actual warnings ourselves when present so they're actionable.
    const { schema, warnings } = modify(jsfSchema, {
      ...modifyConfig,
      muteLogging: true,
    } as Parameters<typeof modify>[1]);
    if (warnings && warnings.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('jsfModify warnings:', warnings);
    }
    jsfSchema = schema;

    if (required) {
      const baseRequired = Array.isArray(schema.required)
        ? schema.required
        : [];

      if (typeof required === 'function') {
        // Function: allows full control over required fields
        jsfSchema.required = required(baseRequired);
      } else {
        // Array: merge with existing required fields (backwards compatible)
        jsfSchema.required = [...baseRequired, ...required];
      }
    }

    if (allOf) {
      jsfSchema.allOf = [
        ...(Array.isArray(schema.allOf) ? schema.allOf : []),
        ...allOf,
      ];
    }
  }

  let moneyFieldsData: Record<string, number | null> = {};

  if (fieldValues) {
    const moneyFields = findFieldsByType(jsfSchema.properties || {}, 'money');
    const { fieldsWithDefaults } = extractMoneyDefaults(jsfSchema);

    moneyFieldsData = moneyFields.reduce<Record<string, number | null>>(
      (acc, field) => {
        // If field has a default value and the current value matches it,
        // don't convert to cents as it's already in cents
        if (
          fieldsWithDefaults.has(field) &&
          fieldValues[field] === getFieldDefault(jsfSchema, field)
        ) {
          acc[field] = fieldValues[field] as number;
        } else {
          acc[field] = convertToCents(fieldValues[field]);
        }
        return acc;
      },
      {},
    );
  }

  console.log('moneyFieldsData', moneyFieldsData);
  console.log('fieldValues', fieldValues);

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

  const headlessForm = baseCreateHeadlessForm(jsfSchema, {
    initialValues,
  });

  return {
    meta: {
      // Support for both x-jsf-fieldsets and x-rmt-flatFieldsets
      // before x-jsf-fieldsets was used, but it was migrated to x-rmt-flatFieldsets
      // this allows to everything to keep working as expected without renaming the whole thing
      'x-jsf-fieldsets':
        (jsfSchema['x-jsf-fieldsets'] as JSFFieldset) ||
        (jsfSchema['x-rmt-flatFieldsets'] as JSFFieldset),
      'x-jsf-presentation': jsfSchema['x-jsf-presentation'] as
        | Record<string, unknown>
        | undefined,
    },
    ...headlessForm,
  };
};
