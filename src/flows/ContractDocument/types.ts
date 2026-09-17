import React from 'react';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';

export type ContractDocumentStepKeys = 'contract_details' | 'contract_preview';

export type UseContractDocumentOptions = {
  /**
   * The contractor to create the contract document for.
   */
  employmentId: string;
};

export type ContractDocumentFlowProps = {
  /**
   * The contractor to create the contract document for. Sourcing it is yours — a route
   * param, the row the user clicked; the flow only ever acts on this one contractor.
   */
  employmentId: string;
  render: (
    contractDocumentBag: ReturnType<typeof useContractDocument>,
  ) => React.ReactNode;
};
