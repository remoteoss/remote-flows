import {
  createHeadlessForm as baseCreateHeadlessForm,
  modify,
} from '@remoteoss/remote-json-schema-form-kit';
import { convertToCents } from '../money';
import { parseJSFToValidate } from './form';
import type { FileConverter } from './form';
import type {
  FieldValues,
  JSFFieldset,
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
  $TSFixMe,
} from '../types';

export function findFieldsByType(
  fields: Record<string, $TSFixMe>,
  type: string,
) {
  const fieldsNames = [];
  for (const [key, value] of Object.entries(fields)) {
    // old schemas use type, new schemas use inputType
    // as probably we need to support both for now, that's why we check both
    if (
      value['x-jsf-presentation'].type === type ||
      value['x-jsf-presentation'].inputType === type
    ) {
      fieldsNames.push(key);
    }
  }
  return fieldsNames;
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
  options?: {
    jsfModify?: JSFModify;
    transformMoneyFields?: boolean;
    logModifyWarnings?: boolean;
  },
): JSONSchemaFormResultWithFieldsets => {
  const transformMoneyFields = options?.transformMoneyFields ?? true;
  if (options && options.jsfModify) {
    const { required, allOf, ...modifyConfig } = options.jsfModify;
    // muteLogging: true suppresses the generic library log; we surface the
    // actual warnings ourselves when present so they're actionable.
    const { schema, warnings } = modify(jsfSchema, {
      ...modifyConfig,
      muteLogging: true,
    } as Parameters<typeof modify>[1]);
    if (warnings && warnings.length > 0) {
      // FIELD_TO_CHANGE_NOT_FOUND is expected noise, not a bug: some field
      // customizations (e.g. equity_compensation) are shared across every
      // onboarding contract details schema even though not every country's schema defines
      // that field. Only surface the warning types that do indicate a real
      // misconfiguration, and only in this repo's own dev build (see
      // RF_INTERNAL_DEV in tsdown.config.ts) — never to consumers of the
      // published package.
      const actionableWarnings = warnings.filter(
        (warning) => warning?.type !== 'FIELD_TO_CHANGE_NOT_FOUND',
      );
      if (actionableWarnings.length > 0 && options.logModifyWarnings) {
        console.warn('jsfModify warnings:', actionableWarnings);
      }
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

export type HeadlessFormStrategy = 'rebuild' | 'buildOnce';

export type HeadlessFormOptions = {
  jsfModify?: JSFModify;
  logModifyWarnings?: boolean;
};

type FieldNode = {
  name: string;
  type?: string;
  isVisible?: boolean;
  valueGroupingDisabled?: boolean;
  fields?: unknown;
};

const isPlainObject = (value: unknown): value is FieldValues =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function withFieldsetObjects(
  values: FieldValues,
  fields: unknown,
): FieldValues {
  if (!Array.isArray(fields)) {
    return values;
  }
  return (fields as FieldNode[]).reduce<FieldValues>((acc, field) => {
    if (field.isVisible === false) {
      return acc;
    }
    if (field.valueGroupingDisabled) {
      return withFieldsetObjects(acc, field.fields);
    }
    if (field.type !== 'fieldset') {
      return acc;
    }
    const fieldsetValue = acc[field.name];
    return {
      ...acc,
      [field.name]: withFieldsetObjects(
        isPlainObject(fieldsetValue) ? fieldsetValue : {},
        field.fields,
      ),
    };
  }, values);
}

export function buildHeadlessForm(
  schema: Record<string, unknown>,
  strategy: HeadlessFormStrategy,
  values: FieldValues | undefined,
  options?: HeadlessFormOptions,
): JSONSchemaFormResultWithFieldsets {
  if (strategy === 'rebuild') {
    return createHeadlessForm(schema, values, options);
  }
  return createHeadlessForm(schema, values ?? {}, {
    ...options,
    transformMoneyFields: false,
  });
}

export function parseValuesForValidation(
  form: JSONSchemaFormResultWithFieldsets,
  strategy: HeadlessFormStrategy,
  values: FieldValues,
  convertFiles: FileConverter,
): Promise<FieldValues> {
  // buildOnce keeps invisible values on purpose. The fields still hold the
  // visibility of the previous change, so dropping their values would hide
  // what a field that is about to become visible needs to compute itself:
  // a hidden fieldset coming back would lose the values driving its own
  // children. handleValidation resolves the visibility first and nulls
  // whatever it considers hidden afterwards, which is the right order.
  return parseJSFToValidate(values, form.fields, {
    isPartialValidation: strategy === 'buildOnce',
    convertFiles,
  });
}
