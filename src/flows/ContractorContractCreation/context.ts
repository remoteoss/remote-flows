import type { ContractorContractCreationFlowBag } from '@/src/flows/ContractorContractCreation/types';
import { createContext, useContext } from 'react';

export const ContractorContractCreationContext = createContext<{
  formId: string | undefined;
  contractorContractCreationBag: ContractorContractCreationFlowBag | null;
}>({
  formId: undefined,
  contractorContractCreationBag: null,
});

export const useContractorContractCreationContext = () => {
  const context = useContext(ContractorContractCreationContext);
  if (!context.formId || !context.contractorContractCreationBag) {
    throw new Error(
      'useContractorContractCreationContext must be used within a ContractorContractCreationFlow',
    );
  }

  return {
    formId: context.formId,
    contractorContractCreationBag: context.contractorContractCreationBag,
  } as const;
};
