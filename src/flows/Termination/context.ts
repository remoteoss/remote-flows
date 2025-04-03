/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

type TerminationFormValues = {
  is_confidential: string;
};

export const TerminationContext = createContext<{
  form: UseFormReturn<TerminationFormValues> | null;
  formId: string | undefined;
  termination: {
    fields: any[];
    checkFieldUpdates: (values: any) => void;
    onSubmit: (values: any) => Promise<void>;
  };
}>({
  form: null,
  formId: undefined,
  termination: {
    fields: [],
    checkFieldUpdates: () => {},
    onSubmit: async () => {},
  },
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
    termination: context.termination,
  } as const;
};
