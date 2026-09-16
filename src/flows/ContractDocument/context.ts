import { createContext, useContext } from 'react';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';

export const ContractDocumentContext = createContext<{
  formId: string | undefined;
  contractDocumentBag: ReturnType<typeof useContractDocument> | null;
}>({
  formId: undefined,
  contractDocumentBag: null,
});

export const useContractDocumentContext = () => {
  const context = useContext(ContractDocumentContext);
  if (!context.formId || !context.contractDocumentBag) {
    throw new Error(
      'useContractDocumentContext must be used within a ContractDocumentFlow',
    );
  }

  return {
    formId: context.formId,
    contractDocumentBag: context.contractDocumentBag,
  } as const;
};
