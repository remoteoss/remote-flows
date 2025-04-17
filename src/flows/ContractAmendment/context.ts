import { createContext, useContext } from 'react';
import { useContractAmendment } from './hooks';

export const ContractAmendmentContext = createContext<{
  formId: string | undefined;
  contractAmendmentBag: ReturnType<typeof useContractAmendment> | null;
}>({ formId: undefined, contractAmendmentBag: null });

export const useContractAmendmentContext = () => {
  const context = useContext(ContractAmendmentContext);
  if (!context.contractAmendmentBag) {
    throw new Error(
      'useContractAmendmentContext must be used within a ContractAmendmentProvider',
    );
  }

  return {
    formId: context.formId,
    contractAmendment: context.contractAmendmentBag,
  } as const;
};
