import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type UseHeadlessFormArgs = {
  schema: Record<string, unknown> | undefined;
  values: FieldValues;
  options?: { jsfModify?: JSFModify };
  strategy: HeadlessFormStrategy;
};

export type HeadlessForm = {
  form: JSONSchemaFormResultWithFieldsets | null;
  isBuilding: boolean;
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
  onValuesChange: (values: FieldValues) => Promise<void>;
  parseFormValues: (values: FieldValues) => Promise<FieldValues>;
};

export function useHeadlessForm({
  schema,
  values,
  options,
  strategy,
}: UseHeadlessFormArgs): HeadlessForm {
  const isBuildOnce = strategy === 'buildOnce';
  const [, setRevision] = useState(0);
  const [resolved, setResolved] = useState<{
    schema: Record<string, unknown>;
    form: JSONSchemaFormResultWithFieldsets;
  } | null>(null);
  const [stableOptions, setStableOptions] = useState(options);
  if (!equal(stableOptions, options)) {
    setStableOptions(options);
  }
  const latestValues = useRef(values);
  useEffect(() => {
    latestValues.current = values;
  });

  const buildValues = isBuildOnce ? undefined : values;

  const builtForm = useMemo(() => {
    if (!schema) return null;
    return isBuildOnce
      ? createHeadlessForm(
          schema,
          {},
          { ...stableOptions, transformMoneyFields: false },
        )
      : createHeadlessForm(schema, buildValues, stableOptions);
  }, [schema, buildValues, stableOptions, isBuildOnce]);

  const form = !isBuildOnce
    ? builtForm
    : resolved && resolved.schema === schema
      ? resolved.form
      : null;

  const validateForm = useCallback(
    async (
      target: JSONSchemaFormResultWithFieldsets | null,
      nextValues: FieldValues,
      isCancelled: () => boolean,
    ) => {
      if (!target) return null;
      // buildOnce keeps invisible values on purpose. The fields still hold the
      // visibility of the previous change, so dropping their values would hide
      // what a field that is about to become visible needs to compute itself:
      // a hidden fieldset coming back would lose the values driving its own
      // children. handleValidation resolves the visibility first and nulls
      // whatever it considers hidden afterwards, which is the right order.
      const parsedValues = await parseJSFToValidate(nextValues, target.fields, {
        isPartialValidation: isBuildOnce,
      });
      if (isCancelled()) return null;
      const result = target.handleValidation(parsedValues);
      if (isBuildOnce) setRevision((revision) => revision + 1);
      return result;
    },
    [isBuildOnce],
  );

  const handleValidation = useCallback(
    (nextValues: FieldValues) => validateForm(form, nextValues, () => false),
    [validateForm, form],
  );

  const onValuesChange = useCallback(
    async (nextValues: FieldValues) => {
      if (isBuildOnce) await handleValidation(nextValues);
    },
    [handleValidation, isBuildOnce],
  );

  useEffect(() => {
    if (!isBuildOnce || !schema || !builtForm) return;
    let cancelled = false;
    void validateForm(builtForm, latestValues.current, () => cancelled).then(
      () => {
        if (!cancelled) setResolved({ schema, form: builtForm });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [validateForm, builtForm, schema, isBuildOnce]);

  const parseFormValues = useCallback(
    async (nextValues: FieldValues) =>
      form ? parseJSFToValidate(nextValues, form.fields) : {},
    [form],
  );

  const isBuilding = Boolean(schema) && !form;

  return {
    form,
    isBuilding,
    handleValidation,
    onValuesChange,
    parseFormValues,
  };
}
