import { useCallback, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import {
  buildHeadlessForm,
  HeadlessFormOptions,
  parseValuesForValidation,
  withFieldsetObjects,
} from '@/src/common/headlessForm';
import { useDeepStable } from '@/src/common/hooks';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

export type { HeadlessFormStrategy } from '@/src/common/headlessForm';

type Schema = Record<string, unknown>;

type UseHeadlessFormArgs = {
  schema: Schema | undefined;
  options?: HeadlessFormOptions;
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
      return buildHeadlessForm(schema, strategy, rebuildValues, stableOptions);
    }
    const buildValues =
      lastValidated.current?.schema === schema
        ? lastValidated.current.values
        : stableInitialValues;
    return buildHeadlessForm(schema, strategy, buildValues, stableOptions);
  }, [
    schema,
    strategy,
    rebuildValues,
    stableOptions,
    stableInitialValues,
    isBuildOnce,
  ]);

  const handleValidation = useCallback(
    async (nextValues: FieldValues) => {
      if (!form || !schema) return null;
      const parsedValues = await parseValuesForValidation(
        form,
        strategy,
        nextValues,
      );
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
    [form, schema, strategy, isBuildOnce],
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
