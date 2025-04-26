import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect, useRef } from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { OffboardingResponse, PostCreateOffboardingError } from '@/src/client';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import isEqual from 'lodash/isEqual';

type TerminationFormProps = {
  username: string;
  onSubmit?: (values: TerminationFormValues) => Promise<void>;
  onError?: (error: PostCreateOffboardingError) => void;
  onSuccess?: (data: OffboardingResponse) => void;
};

export function TerminationForm({
  username,
  onSubmit,
  onError,
  onSuccess,
}: TerminationFormProps) {
  const { formId, terminationBag } = useTerminationContext();

  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    terminationBag.handleValidation,
  );

  const previousInitialValuesRef = useRef<TerminationFormValues | null>(null);

  const form = useForm({
    resolver,
    defaultValues: terminationBag?.initialValues,
    shouldUnregister: false,
    mode: 'onBlur',
  });

  useEffect(() => {
    const subscription = form?.watch((values) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        // TODO: for some reason isDirty doesn't work the first time we touch the form
        terminationBag?.checkFieldUpdates(
          values as Partial<TerminationFormValues>,
        );
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (terminationBag?.initialValues) {
      const previousInitialValues = previousInitialValuesRef.current;

      // Compare current initialValues with the previous ones
      if (!isEqual(previousInitialValues, terminationBag.initialValues)) {
        form.reset(terminationBag.initialValues); // Reset the form if initialValues have changed
        previousInitialValuesRef.current = terminationBag.initialValues; // Update the ref with the new initialValues
        terminationBag?.checkFieldUpdates(
          terminationBag.initialValues as Partial<TerminationFormValues>,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminationBag?.initialValues, form]);

  const handleSubmit = async (values: TerminationFormValues) => {
    await onSubmit?.(values);

    const terminationResult = await terminationBag?.onSubmit(values);

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
