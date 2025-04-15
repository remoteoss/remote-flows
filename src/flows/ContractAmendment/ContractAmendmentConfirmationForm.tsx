import {
  ContractAmendmentResponse,
  PostCreateContractAmendmentError,
} from '@/src/client';
import { Form } from '@/src/components/ui/form';
import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useContractAmendmentContext } from './context';

type ContractAmendmentConfirmationFormProps = {
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
  onError?: (error: PostCreateContractAmendmentError) => void;
  /**
   * Callback function to be called when the contract amendment is successfully submitted.
   * @param data
   * @returns
   */
  onSuccess?: (data: ContractAmendmentResponse) => void;
};

export function ContractAmendmentConfirmationForm({
  onSubmit,
  onError,
  onSuccess,
}: ContractAmendmentConfirmationFormProps) {
  const {
    contractAmendment: {
      values,
      isSubmitting,
      onSubmit: submitContractAmendment,
    },
    formId,
  } = useContractAmendmentContext();
  const form = useForm({
    defaultValues: values,
  });

  const handleSubmit = async (values: FieldValues) => {
    await onSubmit?.(values);

    const contractAmendmentResult = await submitContractAmendment(values);

    if (contractAmendmentResult.error) {
      onError?.(
        contractAmendmentResult.error as PostCreateContractAmendmentError,
      );
    } else {
      onSuccess?.(contractAmendmentResult.data as ContractAmendmentResponse);
    }
  };

  // Ensure that step
  if (isSubmitting) {
    return null;
  }

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="RemoteFlows__ContractAmendmentConfirmationForm"
      ></form>
    </Form>
  );
}
