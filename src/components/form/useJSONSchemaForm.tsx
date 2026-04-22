import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import equal from 'fast-deep-equal';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';

type UseJsonSchemaFormOptions = {
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
  defaultValues: Record<string, unknown>;
  checkFieldUpdates: (values: FieldValues) => void;
};

export function useJSONSchemaForm({
  handleValidation,
  defaultValues,
  checkFieldUpdates,
}: UseJsonSchemaFormOptions): UseFormReturn<$TSFixMe> {
  const resolver = useJsonSchemasValidationFormResolver(handleValidation);
  const prevValuesRef = useRef(defaultValues);

  const form = useForm({
    resolver,
    defaultValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });
  // Watch form changes and trigger checkFieldUpdates
  useEffect(() => {
    const subscription = form?.watch((values) => {
      const hasChanged = !equal(values, prevValuesRef.current);
      if (hasChanged) {
        checkFieldUpdates(values);
        prevValuesRef.current = JSON.parse(JSON.stringify(values));
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fix for conditional fields: Fields inside JSON Schema if/then/else start with
  // empty values ('') before their condition is met. Once active, their real defaults
  // (e.g., working_days: ['monday', ...]) need to be applied without resetting the form.
  useEffect(() => {
    const currentValues = form.getValues();

    Object.keys(defaultValues).forEach((fieldName) => {
      const currentValue = currentValues[fieldName];
      const defaultValue = defaultValues[fieldName];
      const isEmpty =
        currentValue === undefined ||
        currentValue === null ||
        currentValue === '';
      const hasDefault =
        defaultValue !== undefined &&
        defaultValue !== null &&
        defaultValue !== '';

      if (isEmpty && hasDefault && !form.formState.dirtyFields[fieldName]) {
        form.setValue(fieldName, defaultValue, { shouldValidate: false });
      }
    });
  }, [defaultValues, form]);

  return form;
}
