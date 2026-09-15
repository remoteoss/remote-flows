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
