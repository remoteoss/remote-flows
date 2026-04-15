import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';

type UseJsonSchemaFormOptions = {
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
  defaultValues: Record<string, unknown>;
  checkFieldUpdates: (values: FieldValues) => void;
  initialValues?: Record<string, unknown>;
};
export function useJsonSchemaForm({
  handleValidation,
  defaultValues,
  checkFieldUpdates,
  initialValues,
}: UseJsonSchemaFormOptions): UseFormReturn<$TSFixMe> {
  const resolver = useJsonSchemasValidationFormResolver(handleValidation);

  const form = useForm({
    resolver,
    defaultValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });
  // Watch form changes and trigger checkFieldUpdates
  useEffect(() => {
    const subscription = form.watch((values) => {
      const compareAgainst = initialValues || defaultValues;
      const hasChanged = Object.keys(values).some(
        (key) => values[key] !== compareAgainst[key],
      );

      if (hasChanged) {
        checkFieldUpdates(values);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, checkFieldUpdates, defaultValues, initialValues]);

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
