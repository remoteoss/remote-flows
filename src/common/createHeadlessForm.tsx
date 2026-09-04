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
import { JSFFieldset, RemoteFlowsSDKProps } from '@/src/types/remoteFlows';

type JsfEngineFallback = NonNullable<RemoteFlowsSDKProps['jsfEngineFallback']>;

// Engine used for schemas that don't declare a version in `x-rmt-meta`.
// Kit >=1.0.0 runs undeclared schemas on the v1 engine, but undeclared schemas
// (our local static schemas, gateway responses predating the `x-rmt-meta`
// stamping) were authored against v0 — so the SDK falls back to v0 until
// consumers opt into v1 via the `jsfEngineFallback` prop on `<RemoteFlows>`.
let jsfEngineFallback: JsfEngineFallback = 'v0';

export const setJsfEngineFallback = (engine: JsfEngineFallback = 'v0') => {
  jsfEngineFallback = engine;
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
  options?: { jsfModify?: JSFModify; transformMoneyFields?: boolean },
): JSONSchemaFormResultWithFieldsets => {
  const { transformMoneyFields } = options || {
    transformMoneyFields: true,
  };

  // A schema that declares its engine version in `x-rmt-meta` is left
  // untouched; an undeclared one is stamped with the configured fallback
  // (kit >=1.0.0 would otherwise run it on the v1 engine).
  if (!jsfSchema['x-rmt-meta'] && jsfEngineFallback === 'v0') {
    jsfSchema = { ...jsfSchema, 'x-rmt-meta': { jsfOldVersion: true } };
  }
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

  if (fieldValues && transformMoneyFields) {
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
