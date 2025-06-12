import { useState, useCallback } from 'react';
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
  steps: Record<T, Step<T>>,
) => {
  const stepKeys = Object.keys(steps) as Array<keyof typeof steps>;

  if (stepKeys.length === 0) {
    throw new Error('No steps provided to useStepState');
  }

  const [fieldValues, setFieldValues] = useState<Fields>({} as Fields);
  const [stepState, setStepState] = useState<StepState<T, Fields>>({
    currentStep: steps[stepKeys[0]],
    totalSteps: stepKeys.length,
    values: null,
  });

  const nextStep = useCallback(() => {
    const { index } = stepState.currentStep;
    const stepValues = Object.values<Step<T>>(steps);
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
      setFieldValues({} as Fields);
    }
  }, [fieldValues, stepState.currentStep, steps]);

  const previousStep = useCallback(() => {
    const { index } = stepState.currentStep;
    const stepValues = Object.values<Step<T>>(steps);
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
      setFieldValues({} as Fields);
    }
  }, [fieldValues, stepState.currentStep, steps]);

  const goToStep = useCallback(
    (step: T) => {
      setStepState((previousState) => {
        // Check if we have values for this step
        if (previousState.values?.[step]) {
          return {
            ...previousState,
            currentStep: steps[step],
          };
        }
        return previousState;
      });
    },
    [steps],
  );

  const setStepValues = useCallback((values: Record<T, Fields>) => {
    setStepState((previousState) => ({
      ...previousState,
      values: values,
    }));
  }, []);

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
    /**
     * Sets the step values for the step state.
     * This is used to update all values in the step state.
     * @param values The values to set for the all steps.
     * @returns {void}
     */
    setStepValues,
  };
};
