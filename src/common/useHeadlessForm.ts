import { useCallback, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useDeepStable } from '@/src/common/hooks';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  JSFModify,
  JSONSchemaFormResultWithFieldsets,
} from '@/src/flows/types';

export type HeadlessFormStrategy = 'rebuild' | 'buildOnce';

type Schema = Record<string, unknown>;

type UseHeadlessFormArgs = {
  schema: Schema | undefined;
  options?: { jsfModify?: JSFModify };
} & (
  | { strategy: 'buildOnce'; initialValues?: FieldValues }
  | { strategy: 'rebuild'; values: FieldValues }
);

export type HeadlessForm = {
  form: JSONSchemaFormResultWithFieldsets | null;
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
  onValuesChange: (values: FieldValues) => Promise<void>;
  parseFormValues: (values: FieldValues) => Promise<FieldValues>;
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

function withFieldsetObjects(
  values: FieldValues,
  fields: unknown,
): FieldValues {
  if (!Array.isArray(fields)) return values;
  return (fields as FieldNode[]).reduce<FieldValues>((acc, field) => {
    if (field.isVisible === false) return acc;
    if (field.valueGroupingDisabled) {
      return withFieldsetObjects(acc, field.fields);
    }
    if (field.type !== 'fieldset') return acc;
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

export function useHeadlessForm(args: UseHeadlessFormArgs): HeadlessForm {
  const { schema, options, strategy } = args;
  const isBuildOnce = strategy === 'buildOnce';
  const [, setRevision] = useState(0);
  const stableOptions = useDeepStable(options);
  const stableInitialValues = useDeepStable(
    args.strategy === 'buildOnce' ? args.initialValues : undefined,
  );
  const rebuildValues = args.strategy === 'rebuild' ? args.values : undefined;
  const lastValidated = useRef<{ schema: Schema; values: FieldValues } | null>(
    null,
  );

  const form = useMemo(() => {
    if (!schema) return null;
    if (!isBuildOnce) {
      return createHeadlessForm(schema, rebuildValues, stableOptions);
    }
    const buildValues =
      lastValidated.current?.schema === schema
        ? lastValidated.current.values
        : stableInitialValues;
    return createHeadlessForm(schema, buildValues ?? {}, {
      ...stableOptions,
      transformMoneyFields: false,
    });
  }, [schema, rebuildValues, stableOptions, stableInitialValues, isBuildOnce]);

  const handleValidation = useCallback(
    async (nextValues: FieldValues) => {
      if (!form || !schema) return null;
      // buildOnce keeps invisible values on purpose. The fields still hold the
      // visibility of the previous change, so dropping their values would hide
      // what a field that is about to become visible needs to compute itself:
      // a hidden fieldset coming back would lose the values driving its own
      // children. handleValidation resolves the visibility first and nulls
      // whatever it considers hidden afterwards, which is the right order.
      const parsedValues = await parseJSFToValidate(nextValues, form.fields, {
        isPartialValidation: isBuildOnce,
      });
      if (isBuildOnce) {
        lastValidated.current = {
          schema,
          values: JSON.parse(JSON.stringify(parsedValues)),
        };
      }
      // An untouched fieldset has no value, so jsf v1 reports one error for the
      // whole fieldset, which no input can display. An empty object makes it
      // check the fields inside, so their own errors show up.
      const result = form.handleValidation(
        withFieldsetObjects(parsedValues, form.fields),
      );
      if (isBuildOnce) setRevision((revision) => revision + 1);
      return result;
    },
    [form, schema, isBuildOnce],
  );

  const onValuesChange = useCallback(
    async (nextValues: FieldValues) => {
      if (isBuildOnce) await handleValidation(nextValues);
    },
    [handleValidation, isBuildOnce],
  );

  const parseFormValues = useCallback(
    async (nextValues: FieldValues) =>
      form ? parseJSFToValidate(nextValues, form.fields) : {},
    [form],
  );

  return { form, handleValidation, onValuesChange, parseFormValues };
}
