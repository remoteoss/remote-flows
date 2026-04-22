import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

/**
 * Converts a JSON schema to JSF (JSON Schema Form) fields
 * This is a test helper that mimics what the real API does
 */
export function createTestFormFromSchema(
  schema: Record<string, unknown>,
  fieldValues: Record<string, unknown> = {},
): JSONSchemaFormResultWithFieldsets {
  return createHeadlessForm(schema, fieldValues);
}
