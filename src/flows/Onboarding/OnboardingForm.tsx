import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useOnboardingContext } from './context';
import { FieldValues, useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { Fields } from '@remoteoss/json-schema-form';
import {
  BasicInformationFormPayload,
  BenefitsFormPayload,
  ContractDetailsFormPayload,
} from '@/src/flows/Onboarding/types';
import { Components } from '@/src/types/remoteFlows';

type OnboardingFormProps = {
  onSubmit: (
    payload:
      | BasicInformationFormPayload
      | BenefitsFormPayload
      | ContractDetailsFormPayload,
  ) => void;
  components?: Components;
  fields?: Fields;
  defaultValues: Record<string, unknown>;
};

export function OnboardingForm({
  defaultValues,
  onSubmit,
  components,
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
    // When the employmentId is set,
    // we need to run the checkFieldUpdates to update fieldValues in useStepState
    if (onboardingBag.employmentId) {
      onboardingBag?.checkFieldUpdates(form.getValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isAnyFieldDirty = Object.keys(values).some(
        (key) =>
          values[key as keyof unknown] !== defaultValues[key as keyof unknown],
      );
      if (isAnyFieldDirty) {
        onboardingBag?.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(values: FieldValues) {
    onboardingBag.updateMetadata(values, onboardingBag.fields);
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__OnboardingForm"
      >
        <JSONSchemaFormFields
          components={components}
          fields={onboardingBag.fields}
        />
      </form>
    </Form>
  );
}
