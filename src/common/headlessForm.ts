import { FieldValues } from 'react-hook-form';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
} from '@/src/flows/types';

export type HeadlessFormStrategy = 'rebuild' | 'buildOnce';

export type HeadlessFormOptions = { jsfModify?: JSFModify };

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
): Promise<FieldValues> {
  // buildOnce keeps invisible values on purpose. The fields still hold the
  // visibility of the previous change, so dropping their values would hide
  // what a field that is about to become visible needs to compute itself:
  // a hidden fieldset coming back would lose the values driving its own
  // children. handleValidation resolves the visibility first and nulls
  // whatever it considers hidden afterwards, which is the right order.
  return parseJSFToValidate(values, form.fields, {
    isPartialValidation: strategy === 'buildOnce',
  });
}
