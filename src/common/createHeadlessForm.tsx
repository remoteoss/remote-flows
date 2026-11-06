import { createHeadlessForm as createHeadlessFormCore } from '@remoteoss/remote-flows-core';
import type { FieldValues } from '@remoteoss/remote-flows-core';
import {
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
} from '@/src/flows/types';

export const createHeadlessForm = (
  jsfSchema: Record<string, unknown>,
  fieldValues?: FieldValues,
  options?: { jsfModify?: JSFModify; transformMoneyFields?: boolean },
): JSONSchemaFormResultWithFieldsets =>
  createHeadlessFormCore(jsfSchema, fieldValues, {
    ...options,
    logModifyWarnings: process.env.RF_INTERNAL_DEV === 'true',
  });
