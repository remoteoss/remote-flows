import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useOnboardingContext } from './context';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Fields } from '@remoteoss/json-schema-form';
import { BasicInformationFormPayload } from '@/src/flows/Onboarding/types';

type OnboardingFormProps = {
  onSubmit: (payload: BasicInformationFormPayload) => void;
  fields?: Fields;
  defaultValues: Record<string, unknown>;
};

export function OnboardingForm({
  fields,
  defaultValues,
  onSubmit,
}: OnboardingFormProps) {
  const { formId, onboardingBag } = useOnboardingContext();

  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    onboardingBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (onboardingBag.employmentId) {
      // When the employmentId is set, we need to run the checkFieldUpdates to update fieldValues in useStepState
      onboardingBag?.checkFieldUpdates(form.getValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
