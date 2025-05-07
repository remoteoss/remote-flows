import React from 'react';
import { useTerminationContext } from './context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { TerminationForm } from '@/src/flows/Termination/TerminationForm';

type TerminationDetailsFormProps = {
  onSubmit?: (payload: TerminationFormValues) => void | Promise<void>;
};

export function TerminationDetailsForm({
  onSubmit,
}: TerminationDetailsFormProps) {
  const { terminationBag } = useTerminationContext();
  const handleSubmit = async (values: TerminationFormValues) => {
    await onSubmit?.(
      terminationBag?.parseFormValues(values) as TerminationFormValues,
    );
    terminationBag?.next();
  };

  return <TerminationForm onSubmit={handleSubmit} />;
}
