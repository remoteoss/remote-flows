import { TimeOffStepKeys } from '@/src/flows/TimeOff/types';
import { STEPS, STEPS_ARRAY } from '@/src/flows/TimeOff/utils';
import { useStepState } from '@/src/flows/useStepState';

/**
 * Headless hook powering the time-off flow.
 */
export const useTimeOff = () => {
  const { stepState, nextStep, previousStep, goToStep } =
    useStepState<TimeOffStepKeys>(STEPS);

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
  };
};
