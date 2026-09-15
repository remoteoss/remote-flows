import React from 'react';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';

export type ContractDocumentStepKeys = 'contract_details' | 'contract_preview';

export type ContractDocumentFlowProps = {
  render: (
    contractDocumentBag: ReturnType<typeof useContractDocument>,
  ) => React.ReactNode;
};
