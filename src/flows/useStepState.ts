import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

export type Step = {
  index: number;
  name: string;
};

type StepState<T extends string> = {
  currentStep: Step;
  totalSteps: number;
  values:
    | {
        [key in T]: FieldValues;
      }
    | null;
};

export const useStepState = <T extends string>(steps: Record<T, Step>) => {
  const stepKeys = Object.keys(steps) as Array<keyof typeof steps>;

  if (stepKeys.length === 0) {
    throw new Error('No steps provided to useStepState');
  }

  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [stepState, setStepState] = useState<StepState<T>>({
    currentStep: steps[stepKeys[0]],
    totalSteps: stepKeys.length,
    values: null,
  });

  function nextStep() {
    const { index } = stepState.currentStep;
    const stepValues = Object.values<Step>(steps);
    const nextStep = stepValues.find((step) => step.index === index + 1);

    if (nextStep) {
      setStepState((previousState) => ({
        ...previousState,
        currentStep: nextStep,
        values: {
          ...previousState.values,
          [previousState.currentStep.name]: {
            ...previousState.values?.[previousState.currentStep.name as T],
            ...fieldValues,
          },
        } as { [key in T]: FieldValues },
      }));
      setFieldValues({}); // Reset field values for the next step
    }
  }

  function previousStep() {
    const { index } = stepState.currentStep;
    const stepValues = Object.values<Step>(steps);
    const previousStep = stepValues.find((step) => step.index === index - 1);

    if (previousStep) {
      setStepState((previousState) => ({
        ...previousState,
        currentStep: previousStep,
        values: {
          ...previousState.values,
          [previousState.currentStep.name]: {
            ...previousState.values?.[previousState.currentStep.name as T],
            ...fieldValues,
          },
        } as { [key in T]: FieldValues },
      }));
      setFieldValues({}); // Reset field values for the previous step
    }
  }

  return {
    /**
     * Moves to the next step in the step state.
     * It updates the current step and resets the field values for the next step.
     * The field values for the current step are stored in the step state.
     * @returns {void}
     */
    nextStep,
    /**
     * Moves to the previous step in the step state.
     * It updates the current step and resets the field values for the previous step.
     * The field values for the current step are stored in the step state.
     * @returns {void}
     */
    previousStep,
    /**
     * The current step state containing the current step, total number of steps and
     * the form values for each step.
     * @returns {StepState<T>} The current step state.
     */
    stepState,
    /**
     * The field values for the current step.
     * @returns {FieldValues} The field values for the current step.
     */
    fieldValues,
    /**
     * Sets the field values for the current step.
     * @param values The field values to set.
     * @returns {void}
     */
    setFieldValues,
  };
};
