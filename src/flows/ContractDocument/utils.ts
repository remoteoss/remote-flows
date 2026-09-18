import { Employment } from '@/src/client/types.gen';
import {
  contractorPlusProductIdentifier,
  contractorStandardProductIdentifier,
  corProductIdentifier,
} from '@/src/common/contract-documents/constants';
import { Step } from '@/src/flows/useStepState';
import { ContractDocumentStepKeys } from '@/src/flows/ContractDocument/types';

export const STEPS: Record<
  ContractDocumentStepKeys,
  Step<ContractDocumentStepKeys>
> = {
  contract_details: { index: 0, name: 'contract_details' },
  contract_preview: { index: 1, name: 'contract_preview' },
};

const STEP_LABELS: Record<ContractDocumentStepKeys, string> = {
  contract_details: 'Contract Details',
  contract_preview: 'Contract Preview',
};

export const STEPS_ARRAY = Object.values(STEPS).map((step) => ({
  ...step,
  label: STEP_LABELS[step.name],
}));

const PRODUCT_IDENTIFIER_BY_CONTRACTOR_TYPE: Record<
  NonNullable<Employment['contractor_type']>,
  string
> = {
  standard: contractorStandardProductIdentifier,
  plus: contractorPlusProductIdentifier,
  cor: corProductIdentifier,
};

/**
 * The product the contractor is on. The standalone flow has no pricing-plan step, so it is
 * read off the employment instead.
 */
export const getProductIdentifier = (
  contractorType: Employment['contractor_type'],
) =>
  contractorType
    ? PRODUCT_IDENTIFIER_BY_CONTRACTOR_TYPE[contractorType]
    : contractorStandardProductIdentifier;
