import { FieldValues } from 'react-hook-form';
import {
  createHeadlessForm as baseCreateHeadlessForm,
  modify,
} from '@remoteoss/remote-json-schema-form-kit';
import {
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
} from '@/src/flows/types';
import { JSFFieldset } from '@/src/types/remoteFlows';

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

  /**
   * We create a deep copy of the field values to avoid modifying the original object.
   * This problem is caused by json-schema-form-v0.
   */
  const initialValues = JSON.parse(
    JSON.stringify({
      ...fieldValues,
    }),
  );

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
    ...baseCreateHeadlessForm(jsfSchema, {
      initialValues,
    }),
  };
};
