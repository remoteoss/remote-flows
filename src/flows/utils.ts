import { AnyObjectSchema, object } from 'yup';
import { $TSFixMe } from '@remoteoss/json-schema-form';

/**
 * Build the validation schema for the form.
 * @returns
 */
// TODO: repeated code here and in src/flows/CostCalculator/utils.ts
export function buildValidationSchema(fields: $TSFixMe[]) {
  const fieldsSchema = fields.reduce<Record<string, AnyObjectSchema>>(
    (fieldsSchemaAcc, field) => {
      fieldsSchemaAcc[field.name] = field.schema as AnyObjectSchema;
      return fieldsSchemaAcc;
    },
    {},
  );
  return object(fieldsSchema) as AnyObjectSchema;
}

type ParsedRadioValues = Record<string, unknown>;

/**
 * Parses the form values to convert radio button values from 'yes'/'no' to boolean.
 *
 * @param values - The form values as a record of key-value pairs.
 * @param fieldKeys - An array of field keys that represent radio button fields.
 * @returns A new object with the parsed values, where radio button fields are converted to boolean.
 *
 * @example
 * const values = {
 *   ack: 'yes',
 *   confidential: 'no',
 *   username: 'john_doe',
 * };
 * const fieldKeys = ['ack', 'confidential'];
 * const parsedValues = parseFormRadioValues(values, fieldKeys);
 * // Output: { ack: true, confidential: false, username: 'john_doe' }
 */
export function parseFormRadioValues(
  values: Record<string, unknown>,
  fieldKeys: string[],
) {
  return Object.entries(values).reduce<ParsedRadioValues>(
    (acc, [key, value]) => {
      acc[key] = fieldKeys.includes(key) ? value === 'yes' : value;
      return acc;
    },
    {},
  );
}
