import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const latestValues = useRef(values);
  useEffect(() => {
    latestValues.current = values;
  });

  const buildValues = isBuildOnce ? undefined : values;

  const form = useMemo(() => {
    if (!schema) return null;
    return isBuildOnce
      ? createHeadlessForm(
          schema,
          {},
          { ...options, transformMoneyFields: false },
        )
      : createHeadlessForm(schema, buildValues, options);
  }, [schema, buildValues, options, isBuildOnce]);

  const validate = useCallback(
    async (nextValues: FieldValues, isCancelled: () => boolean) => {
      if (!form) return null;
      const parsedValues = await parseJSFToValidate(nextValues, form.fields, {
        isPartialValidation: isBuildOnce,
      });
      if (isCancelled()) return null;
      const result = form.handleValidation(parsedValues);
      if (isBuildOnce) setRevision((revision) => revision + 1);
      return result;
    },
    [form, isBuildOnce],
  );

  const handleValidation = useCallback(
    (nextValues: FieldValues) => validate(nextValues, () => false),
    [validate],
  );

  const onValuesChange = useCallback(
    async (nextValues: FieldValues) => {
      if (isBuildOnce) await handleValidation(nextValues);
    },
    [handleValidation, isBuildOnce],
  );

  useEffect(() => {
    if (!isBuildOnce) return;
    let cancelled = false;
    void validate(latestValues.current, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [validate, isBuildOnce]);

  const parseFormValues = useCallback(
    async (nextValues: FieldValues) =>
      form ? parseJSFToValidate(nextValues, form.fields) : {},
    [form],
  );

  return { form, handleValidation, onValuesChange, parseFormValues };
}
