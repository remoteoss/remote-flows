import type { useTermination } from '@/src/flows/Termination/hooks';
import { createContext, useContext } from 'react';

export const TerminationContext = createContext<{
  formId: string | undefined;
  terminationBag: ReturnType<typeof useTermination> | null;
}>({
  formId: undefined,
  terminationBag: null,
});

export const useTerminationContext = () => {
  const context = useContext(TerminationContext);
  if (!context.formId || !context.terminationBag) {
    throw new Error(
      'useTerminationContext must be used within a TerminationContextProvider',
    );
  }

  return {
    formId: context.formId,
    terminationBag: context.terminationBag,
  } as const;
};
