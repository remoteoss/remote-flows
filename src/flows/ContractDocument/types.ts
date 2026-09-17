import React from 'react';
import { CreateContractDocument } from '@/src/client/types.gen';
import {
  ContractorContractDetailsFormPayload,
  ContractorContractDetailsResponse,
} from '@/src/common/contract-documents/types';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';
import { JSFModify } from '@/src/flows/types';

export type ContractDocumentStepKeys = 'contract_details' | 'contract_preview';

export type ContractDocumentOptions = {
  jsfModify?: {
    contract_details?: JSFModify;
  };
};

export type UseContractDocumentOptions = {
  /**
   * The contractor to create the contract document for.
   */
  employmentId: string;
  options?: ContractDocumentOptions;
};

export type ContractDocumentFlowProps = {
  /**
   * The contractor to create the contract document for. Sourcing it is yours — a route
   * param, the row the user clicked; the flow only ever acts on this one contractor.
   */
  employmentId: string;
  /**
   * Modify the generated JSON-schema form fields, per step.
   */
  options?: ContractDocumentOptions;
  render: (
    contractDocumentBag: ReturnType<typeof useContractDocument>,
  ) => React.ReactNode;
};

/**
 * Values the contract details form collects.
 */
export type ContractDocumentContractDetailsFormValues =
  ContractorContractDetailsFormPayload;

/**
 * The payload sent to `POST /v1/contractors/employments/{employment_id}/contract-documents`.
 */
export type ContractDocumentContractDetailsPayload = CreateContractDocument;

export type ContractDocumentContractDetailsResponse =
  ContractorContractDetailsResponse['data'];
