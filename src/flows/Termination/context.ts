import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

type TerminationFormValues = {
  is_confidential: string;
};

export const TerminationContext = createContext<{
  form: UseFormReturn<TerminationFormValues> | null;
  formId: string | undefined;
}>({ form: null, formId: undefined });

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
  } as const;
};
