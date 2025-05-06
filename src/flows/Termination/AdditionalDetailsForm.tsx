import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { CreateOffboardingParams, OffboardingResponse } from '@/src/client';

type AdditionalDetailsFormProps = {
  username: string;
  onSubmit?: (payload: CreateOffboardingParams) => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: (data: OffboardingResponse) => void;
};

export function AdditionalDetailsForm({
  username,
  onSubmit,
  onSuccess,
  onError,
}: AdditionalDetailsFormProps) {
  const { formId, terminationBag } = useTerminationContext();

  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    terminationBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues: terminationBag?.initialValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isAnyFieldDirty = Object.keys(values).some(
        (key) =>
          values[key as keyof TerminationFormValues] !==
          terminationBag?.initialValues?.[key as keyof TerminationFormValues],
      );
      if (isAnyFieldDirty) {
        terminationBag?.checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: TerminationFormValues) => {
    const terminationResult = await terminationBag?.onSubmit(values, onSubmit);

    if (terminationResult?.error) {
      onError?.(terminationResult.error);
    } else {
      if (terminationResult?.data) {
        onSuccess?.(terminationResult.data as OffboardingResponse);
      }
    }
  };

  const fields = terminationBag?.fields ? terminationBag.fields : [];

  const updatedFields = fields.map((field) => {
    if (field.name === 'acknowledge_termination_procedure') {
      return {
        ...field,
        label: (field.label as string).replace('{{username}}', username),
      };
    }
    return field;
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__TerminationForm"
      >
        <JSONSchemaFormFields fields={updatedFields} />
      </form>
    </Form>
  );
}
