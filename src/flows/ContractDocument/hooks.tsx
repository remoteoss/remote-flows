import { useQuery } from '@tanstack/react-query';
import { Fields } from '@remoteoss/remote-json-schema-form-kit';
import { Client } from '@/src/client/client';
import { useEmploymentQuery } from '@/src/common/api/employment';
import { contractDocumentsOptions } from '@/src/common/contract-documents/api';
import { useClient } from '@/src/context';
import {
  ContractDocumentStepKeys,
  UseContractDocumentOptions,
} from '@/src/flows/ContractDocument/types';
import { STEPS, STEPS_ARRAY } from '@/src/flows/ContractDocument/utils';
import { useStepState } from '@/src/flows/useStepState';

/**
 * Headless hook powering the standalone contract-document flow: the contract details and
 * contract preview screens of contractor onboarding, mountable on their own for the
 * contractor named by `employmentId`.
 */
export const useContractDocument = ({
  employmentId,
}: UseContractDocumentOptions) => {
  const { client } = useClient();
  const { stepState, nextStep, previousStep, goToStep } =
    useStepState<ContractDocumentStepKeys>(STEPS);

  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({
      employmentId,
      queryParams: { exclude_files: true },
      enabled: Boolean(employmentId),
    });

  const { data: contractDocuments, isLoading: isLoadingContractDocuments } =
    useQuery({
      ...contractDocumentsOptions(client as Client, employmentId),
      enabled: Boolean(employmentId),
      select: ({ data }) => data.data.contract_documents,
    });

  return {
    /**
     * Current step state containing the current step and total number of steps.
     */
    stepState,
    /**
     * Every step of the flow, in order.
     */
    steps: STEPS_ARRAY,
    /**
     * Moves to the next step.
     */
    next: nextStep,
    /**
     * Moves to the previous step.
     */
    back: previousStep,
    /**
     * Moves to a specific step.
     */
    goTo: goToStep,
    /**
     * Form fields for the current step.
     */
    fields: [] as Fields,
    /**
     * The contractor the contract document will be created for.
     */
    employmentId,
    /**
     * The contractor's employment.
     */
    employment,
    /**
     * Whether the contractor is a Contractor of Record.
     */
    isContractorOfRecord: employment?.contractor_type === 'cor',
    /**
     * The contract documents the contractor already has. `undefined` until they have
     * loaded, or when loading them failed.
     */
    contractDocuments,
    /**
     * True until the contractor is known: `employmentId` is empty, or the employment and
     * its contract documents are still loading.
     */
    isLoading:
      !employmentId || isLoadingEmployment || isLoadingContractDocuments,
    /**
     * True while a submission is in flight.
     */
    isSubmitting: false,
  };
};
