import type { useTermination } from '@/src/flows/Termination/hooks';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const TerminationContext = createContext<{
  form: UseFormReturn<TerminationFormValues> | null;
  formId: string | undefined;
  terminationBag: ReturnType<typeof useTermination> | null;
}>({
  form: null,
  formId: undefined,
  terminationBag: null,
});

export const useTerminationContext = () => {
  const context = useContext(TerminationContext);
  if (!context.form) {
    throw new Error(
      'useTerminationContext must be used within a TerminationContextProvider',
    );
  }

  return {
    form: context.form,
    formId: context.formId,
    terminationBag: context.terminationBag,
  } as const;
};
