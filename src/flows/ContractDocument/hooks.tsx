import { Fields } from '@remoteoss/remote-json-schema-form-kit';
import { ContractDocumentStepKeys } from '@/src/flows/ContractDocument/types';
import { STEPS, STEPS_ARRAY } from '@/src/flows/ContractDocument/utils';
import { useStepState } from '@/src/flows/useStepState';

/**
 * Headless hook powering the standalone contract-document flow: the contract details and
 * contract preview screens of contractor onboarding, mountable on their own.
 */
export const useContractDocument = () => {
  const { stepState, nextStep, previousStep, goToStep } =
    useStepState<ContractDocumentStepKeys>(STEPS);

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
     * True while the flow is loading data.
     */
    isLoading: false,
    /**
     * True while a submission is in flight.
     */
    isSubmitting: false,
  };
};
