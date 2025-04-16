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

const commonFields = [
  'effective_date',
  'reason_for_change',
  'reason_for_change_description',
  'additional_comments',
  'additional_comments_toggle',
] as const;

type CommonFields = (typeof commonFields)[number];

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
      initialValues,
      onSubmit: submitContractAmendment,
    },
  } = useContractAmendmentContext();

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isFormDirty =
        Object.keys(form.formState.dirtyFields).length > 0 ||
        form.formState.isDirty;
      if (isFormDirty) {
        checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: FieldValues) => {
    let hasContractDetailsChanges = false;
    for (const [key, value] of Object.entries(values)) {
      if (
        !commonFields.includes(key as CommonFields) &&
        // @ts-expect-error error
        initialValues[key] !== value
      ) {
        hasContractDetailsChanges = true;
        break;
      }
    }

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
