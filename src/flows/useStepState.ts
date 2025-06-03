import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

export type Step<T extends string> = {
  index: number;
  name: T;
};

type StepState<T extends string, Fields = FieldValues> = {
  currentStep: Step<T>;
  totalSteps: number;
  values:
    | {
        [key in T]: Fields;
      }
    | null;
};

export const useStepState = <T extends string, Fields = FieldValues>(
  steps: Partial<Record<T, Step<T>>>,
) => {
  const stepKeys = Object.keys(steps) as Array<keyof typeof steps>;

  if (stepKeys.length === 0) {
    throw new Error('No steps provided to useStepState');
  }

  const [fieldValues, setFieldValues] = useState<Fields>({} as Fields);
  const [stepState, setStepState] = useState<StepState<T, Fields>>({
    currentStep: steps[stepKeys[0]] as Step<T>,
    totalSteps: stepKeys.length,
    values: null,
  });

  function nextStep() {
    const { index } = stepState.currentStep;
    const stepValues = Object.values(steps).filter((step): step is Step<T> => step !== undefined);
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
        } as { [key in T]: Fields },
      }));
      setFieldValues({} as Fields); // Reset field values for the next step
    }
  }

  function previousStep() {
    const { index } = stepState.currentStep;
    const stepValues = Object.values(steps).filter((step): step is Step<T> => step !== undefined);
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
        } as { [key in T]: Fields },
      }));
      setFieldValues({} as Fields); // Reset field values for the previous step
    }
  }

  function goToStep(step: T) {
    // to avoid going to a steps that hasn't been filled yet
    if (stepState.values?.[step] && steps[step]) {
      setStepState((previousState) => ({
        ...previousState,
        currentStep: steps[step] as Step<T>,
      }));
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
     * Goes to a specific step in the step state.
     * @param step The step to go to.
     * @returns {void}
     */
    goToStep,
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
