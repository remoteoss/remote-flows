import { useId } from 'react';
import { ContractDocumentContext } from '@/src/flows/ContractDocument/context';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';
import { ContractDocumentFlowProps } from '@/src/flows/ContractDocument/types';

/**
 * Standalone contract-document flow: contract details, then contract preview. Mount it
 * anywhere — it does not depend on the contractor onboarding flow.
 */
export const ContractDocumentFlow = ({
  employmentId,
  options,
  render,
}: ContractDocumentFlowProps) => {
  const formId = useId();
  const contractDocumentBag = useContractDocument({ employmentId, options });

  return (
    <ContractDocumentContext.Provider value={{ formId, contractDocumentBag }}>
      {render(contractDocumentBag)}
    </ContractDocumentContext.Provider>
  );
};
