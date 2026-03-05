import * as react from 'react';
import { FieldValues } from 'react-hook-form';

type Step<T extends string> = {
    index: number;
    name: T;
    visible?: boolean;
};
type StepState<T extends string, Fields = FieldValues> = {
    currentStep: Step<T>;
    totalSteps: number;
    values: {
        [key in T]: Fields;
    } | null;
};
declare const useStepState: <T extends string, Fields = FieldValues>(steps: Record<T, Step<T>>, onStepChange?: (step: Step<T>) => void) => {
    /**
     * Moves to the next step in the step state.
     * It updates the current step and resets the field values for the next step.
     * The field values for the current step are stored in the step state.
     * @returns {void}
     */
    nextStep: () => void;
    /**
     * Moves to the previous step in the step state.
     * It updates the current step and resets the field values for the previous step.
     * The field values for the current step are stored in the step state.
     * @returns {void}
     */
    previousStep: () => void;
    /**
     * The current step state containing the current step, total number of steps and
     * the form values for each step.
     * @returns {StepState<T>} The current step state.
     */
    stepState: StepState<T, Fields>;
    /**
     * Goes to a specific step in the step state.
     * @param step The step to go to.
     * @returns {void}
     */
    goToStep: (step: T) => void;
    /**
     * The field values for the current step.
     * @returns {FieldValues} The field values for the current step.
     */
    fieldValues: Fields;
    /**
     * Sets the field values for the current step.
     * @param values The field values to set.
     * @returns {void}
     */
    setFieldValues: react.Dispatch<react.SetStateAction<Fields>>;
    /**
     * Sets the step values for the step state.
     * This is used to update all values in the step state.
     * @param values The values to set for the all steps.
     * @returns {void}
     */
    setStepValues: (values: Record<T, Fields>) => void;
};

export { type Step, useStepState };
