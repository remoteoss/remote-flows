import React from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { OffboardingResponse } from '@/src/client';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type AdditionalDetailsFormProps = {
  /*
   * The name of the person who initiates the termination, used to personalize the label of the
   * acknowledge_termination_procedure field.
   */
  requesterName: string;
  /*
   * The function is called when the form is submitted. It receives the form values as an argument.
   */
  onSubmit?: (payload: TerminationFormValues) => void | Promise<void>;
  /*
   * The function is called when the form submission has failed.
   */
  onError?: (error: Error) => void;
  /*
   * The function is called when the form submission is successful. It receives the response data as
   * an argument.
   */
  onSuccess?: (data: OffboardingResponse) => void;
};

export function AdditionalDetailsForm({
  requesterName,
  onSubmit,
  onSuccess,
  onError,
}: AdditionalDetailsFormProps) {
  const { terminationBag } = useTerminationContext();

  const handleSubmit = async (values: TerminationFormValues) => {
    await onSubmit?.(
      terminationBag?.parseFormValues(values) as TerminationFormValues,
    );
    const terminationResult = await terminationBag?.onSubmit(values);

    if (terminationResult?.error) {
      onError?.(terminationResult.error);
    } else {
      if (terminationResult?.data) {
        onSuccess?.(terminationResult.data as OffboardingResponse);
      }
    }
  };

  const updatedFields = terminationBag?.fields.map((field) => {
    if (field.name === 'acknowledge_termination_procedure') {
      return {
        ...field,
        label: (field.label as string).replace(
          '{{requesterName}}',
          requesterName,
        ),
      };
    }
    return field;
  });

  return <TerminationForm fields={updatedFields} onSubmit={handleSubmit} />;
}
