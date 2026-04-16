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
  initialValues?: Record<string, unknown>;
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

  return form;
}
