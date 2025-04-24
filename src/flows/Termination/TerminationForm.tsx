import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { OffboardingResponse, PostCreateOffboardingError } from '@/src/client';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';

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

  const form = useForm({
    resolver,
    defaultValues: terminationBag?.initialValues,
    shouldUnregister: true,
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

  const fieldsByStep: Record<string, Record<string, unknown>[]> = {
    employee_communication: updatedFields.filter((field) =>
      [
        'confidential',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
        'personal_email',
      ].includes(field.name as string),
    ),
    termination_details: updatedFields.filter((field) =>
      [
        'termination_reason',
        'reason_description',
        'additional_comments',
        'termination_reason_files',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'will_challenge_termination_description',
        'proposed_termination_date',
      ].includes(field.name as string),
    ),
  };

  const currentStep = terminationBag?.stepState.currentStep.name;
  const currentFields = fieldsByStep[currentStep] || updatedFields;

  console.log({ currentStep });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__TerminationForm"
      >
        <JSONSchemaFormFields fields={currentFields} />
      </form>
    </Form>
  );
}
