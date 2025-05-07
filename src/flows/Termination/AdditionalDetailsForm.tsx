import React from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { CreateOffboardingParams, OffboardingResponse } from '@/src/client';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type AdditionalDetailsFormProps = {
  requesterName: string;
  onSubmit?: (payload: CreateOffboardingParams) => void | Promise<void>;
  onError?: (error: Error) => void;
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
    const terminationResult = await terminationBag?.onSubmit(values, onSubmit);

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
        label: (field.label as string).replace('{{username}}', requesterName),
      };
    }
    return field;
  });

  return <TerminationForm fields={updatedFields} onSubmit={handleSubmit} />;
}
