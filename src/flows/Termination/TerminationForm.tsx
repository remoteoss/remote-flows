import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { OffboardingResponse, PostCreateOffboardingError } from '@/src/client';

type TerminationFormProps = {
  onSubmit?: (values: TerminationFormValues) => Promise<void>;
  onError?: (error: PostCreateOffboardingError) => void;
  onSuccess?: (data: OffboardingResponse) => void;
};

export function TerminationForm({
  onSubmit,
  onError,
  onSuccess,
}: TerminationFormProps) {
  const { form, formId, terminationBag } = useTerminationContext();

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
    const terminationResult = await terminationBag?.onSubmit(values);

    await onSubmit?.(values);
    if (terminationResult?.error) {
      onError?.(terminationResult.error);
    } else {
      onSuccess?.(terminationResult?.data);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__TerminationForm"
      >
        <JSONSchemaFormFields
          fields={terminationBag?.fields ? terminationBag.fields : []}
        />
      </form>
    </Form>
  );
}
