import { convertFilesToBase64 } from '@/src/lib/files';
import {
  buildHeadlessForm as buildHeadlessFormCore,
  parseValuesForValidation as parseValuesForValidationCore,
} from '@remoteoss/remote-flows-core';
import type {
  FieldValues,
  HeadlessFormOptions,
  HeadlessFormStrategy,
  JSONSchemaFormResultWithFieldsets,
} from '@remoteoss/remote-flows-core';

export type { HeadlessFormOptions, HeadlessFormStrategy };
export { withFieldsetObjects } from '@remoteoss/remote-flows-core';

export function buildHeadlessForm(
  schema: Record<string, unknown>,
  strategy: HeadlessFormStrategy,
  values: FieldValues | undefined,
  options?: HeadlessFormOptions,
): JSONSchemaFormResultWithFieldsets {
  return buildHeadlessFormCore(schema, strategy, values, {
    ...options,
    logModifyWarnings: process.env.RF_INTERNAL_DEV === 'true',
  });
}

export function parseValuesForValidation(
  form: JSONSchemaFormResultWithFieldsets,
  strategy: HeadlessFormStrategy,
  values: FieldValues,
): Promise<FieldValues> {
  return parseValuesForValidationCore(
    form,
    strategy,
    values,
    convertFilesToBase64,
  );
}
