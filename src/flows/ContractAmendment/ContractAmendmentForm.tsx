import {
  ContractAmendmentAutomatableResponse,
  PostAutomatableContractAmendmentError,
} from '@/src/client';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Form } from '@/src/components/ui/form';
import React, { useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { useContractAmendmentContext } from './context';

type ContractAmendmentFormProps = {
  /**
   * Callback function to be called when the contract amendment form is submitted.
   * This function is called before the contract amendment is submitted.
   * It can be used to perform any additional validation or processing before
   * the contract amendment is submitted.
   * @param values
   * @returns
   */
  onSubmit?: (values: FieldValues) => Promise<void>;
  /**
   * Callback function to be called when the contract amendment fails.
   * @param error
   * @returns
   */
  onError?: (error: PostAutomatableContractAmendmentError) => void;
  /**
   * Callback function to be called when the contract amendment is successfully submitted.
   * This function is called after the contract amendment is submitted.
   * @param data
   * @returns
   */
  onSuccess?: (data: ContractAmendmentAutomatableResponse) => void;
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
    const { dirtyFields } = form.formState;

    // Check if there are any dirty fields that are not static
    const staticFields = [
      'effective_date',
      'reason_for_change',
      'reason_for_change_description',
      'additional_comments',
      'additional_comments_toggle',
    ];
    const hasContractDetailsChanges = Object.keys(dirtyFields).some(
      (field) => !staticFields.includes(field),
    );

    if (!hasContractDetailsChanges) {
      return onError?.({
        message: 'no_changes_detected_contract_details',
      });
    }

    await onSubmit?.(values);

    const contractAmendmentResult = await submitContractAmendment(values);

    if (contractAmendmentResult.error) {
      onError?.(contractAmendmentResult.error);
    } else {
      onSuccess?.(
        contractAmendmentResult.data as ContractAmendmentAutomatableResponse,
      );
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        data-testid="contract-amendment-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__ContractAmendmentForm"
      >
        <JSONSchemaFormFields fields={fields} />
      </form>
    </Form>
  );
}
