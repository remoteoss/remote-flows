import { useCallback, useMemo, useRef, useState } from 'react';
import equal from 'fast-deep-equal';
import { FieldValues } from 'react-hook-form';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
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

const useDeepStable = <T>(value: T): T => {
  const [stable, setStable] = useState(value);
  if (!equal(stable, value)) {
    setStable(value);
  }
  return stable;
};

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
      const result = form.handleValidation(parsedValues);
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
