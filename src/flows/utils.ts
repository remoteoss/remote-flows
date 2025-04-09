import { AnyObjectSchema, object } from 'yup';
import { Field } from './types';

/**
 * Build the validation schema for the form.
 * @returns
 */
export function buildValidationSchema(fields: Field[]) {
  const fieldsSchema = fields.reduce<Record<string, AnyObjectSchema>>(
    (fieldsSchemaAcc, field) => {
      fieldsSchemaAcc[field.name] = field.schema as AnyObjectSchema;
      return fieldsSchemaAcc;
    },
    {},
  );
  return object(fieldsSchema) as AnyObjectSchema;
}
