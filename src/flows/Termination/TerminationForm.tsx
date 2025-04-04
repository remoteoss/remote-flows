/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { useTerminationContext } from './context';

type ContractAmendmentFormProps = {
  onSubmit?: (values: any) => Promise<void>;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
};

export function TerminationForm({
  onSubmit,
  onError,
  onSuccess,
}: ContractAmendmentFormProps) {
  const {
    form,
    formId,
    termination: {
      checkFieldUpdates,
      fields,
      onSubmit: submitContractAmendment,
    },
  } = useTerminationContext();

  useEffect(() => {
    const subscription = form?.watch((values) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        // TODO: for some reason isDirty doesn't work the first time we touch the form
        checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: any) => {
    const contractAmendmentResult = await submitContractAmendment(values);

    await onSubmit?.(values);
    if (contractAmendmentResult.error) {
      onError?.(contractAmendmentResult.error);
    } else {
      onSuccess?.(contractAmendmentResult.data);
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__TerminationForm"
      >
        <JSONSchemaFormFields fields={fields} />
      </form>
    </Form>
  );
}
