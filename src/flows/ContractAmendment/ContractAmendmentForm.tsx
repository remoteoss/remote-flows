/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { parseFormValuesToAPI } from '@/src/components/form/utils';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { useContractAmendmentContext } from './context';

type ContractAmendmentFormProps = {
  onSubmit?: (values: any) => Promise<void>;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
};

export function ContractAmendmentForm({
  onSubmit,
  onError,
  onSuccess,
}: ContractAmendmentFormProps) {
  const {
    form,
    formId,
    contractAmendment: {
      checkFieldUpdates,
      fields,
      onSubmit: submitContractAmendment,
    },
  } = useContractAmendmentContext();

  useEffect(() => {
    const subscription = form?.watch((values) => {
      if (form.formState.isDirty) {
        checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: FieldValues) => {
    const contractAmendmentResult = await submitContractAmendment(
      parseFormValuesToAPI(values, fields),
    );

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
        className="space-y-4 RemoteFlows__ContractAmendmentForm"
      >
        <JSONSchemaFormFields fields={fields} />
      </form>
    </Form>
  );
}
