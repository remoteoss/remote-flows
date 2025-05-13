import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useOnboardingContext } from './context';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Fields } from '@remoteoss/json-schema-form';

type OnboardingFormProps = {
  onSubmit: (payload: unknown) => void;
  fields?: Fields;
};

export function OnboardingForm({ fields, onSubmit }: OnboardingFormProps) {
  const { formId, onboardingBag } = useOnboardingContext();

  const resolver = useJsonSchemasValidationFormResolver(
    onboardingBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues: onboardingBag?.initialValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isAnyFieldDirty = Object.keys(values).some(
        (key) =>
          values[key as keyof unknown] !==
          onboardingBag?.initialValues?.[key as keyof unknown],
      );
      if (isAnyFieldDirty) {
        onboardingBag?.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jsonSchemaFields = fields ? fields : (onboardingBag?.fields ?? []);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 RemoteFlows__OnboardingForm"
      >
        <JSONSchemaFormFields fields={jsonSchemaFields} />
      </form>
    </Form>
  );
}
