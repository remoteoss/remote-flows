import { useState, useEffect, useRef } from 'react';
import { FieldValues } from 'react-hook-form';

export type Step<T extends string> = {
  index: number;
  name: T;
  visible?: boolean;
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

const getInitialStep = <T extends string>(steps: Record<T, Step<T>>) => {
  const stepValues = Object.values(steps) as Step<T>[];
  const firstVisibleStep = stepValues.find((step) => step.visible !== false);
  return firstVisibleStep || steps[Object.keys(steps)[0] as T]; // Fallback to first if none found
};

export const useStepState = <T extends string, Fields = FieldValues>(
  steps: Record<T, Step<T>>,
  onStepChange?: (step: Step<T>) => void,
) => {
  const stepKeys = Object.keys(steps) as Array<keyof typeof steps>;

  if (stepKeys.length === 0) {
    throw new Error('No steps provided to useStepState');
  }

  // Keep the latest steps in a ref so nextStep/previousStep/goToStep resolve
  // visibility against current data even when invoked from a callback that
  // closed over an earlier render — e.g. right after an async refetch flips a
  // step's visibility but before the component has re-rendered.
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const [fieldValues, setFieldValues] = useState<Fields>({} as Fields);
  const fieldValuesRef = useRef(fieldValues);
  fieldValuesRef.current = fieldValues;
  const initialStep = getInitialStep(steps);
  const [stepState, setStepState] = useState<StepState<T, Fields>>({
    currentStep: initialStep,
    totalSteps: stepKeys.length,
    values: null,
  });

  // Call onStepChange once when the hook initializes
  // Note: intentionally no deps to only run on mount and avoid re-renders
  // when onStepChange/steps references change
  useEffect(() => {
    onStepChange?.(initialStep);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextStep() {
    const { index } = stepState.currentStep;
    const stepValues = Object.values<Step<T>>(stepsRef.current);
    const nextStep = stepValues.find(
      (step) => step.index > index && step.visible !== false,
    );

    if (nextStep) {
      // Captured before setFieldValues({}) below clears it: both updates
      // land in the same render, and fieldValuesRef.current would already
      // reflect the cleared value by the time the setStepState updater runs.
      const capturedFieldValues = fieldValuesRef.current;
      setStepState((previousState) => {
        const currentStepName = previousState.currentStep.name;
        const previousValues = previousState.values?.[currentStepName as T];
        const hasCapturedValues =
          Object.keys(capturedFieldValues as object).length > 0;

        return {
          ...previousState,
          currentStep: nextStep,
          values: {
            ...previousState.values,
            [currentStepName]: hasCapturedValues
              ? { ...previousValues, ...capturedFieldValues }
              : previousValues,
          } as { [key in T]: Fields },
        };
      });
      onStepChange?.(nextStep);
      setFieldValues({} as Fields);
    }
  }

  function previousStep() {
    const { index } = stepState.currentStep;
    const stepValues = Object.values<Step<T>>(stepsRef.current);
    const previousStep = stepValues
      .reverse()
      .find((step) => step.index < index && step.visible !== false);

    if (previousStep) {
      const capturedFieldValues = fieldValuesRef.current;
      setStepState((previousState) => {
        const currentStepName = previousState.currentStep.name;
        const previousValues = previousState.values?.[currentStepName as T];
        const hasCapturedValues =
          Object.keys(capturedFieldValues as object).length > 0;

        return {
          ...previousState,
          currentStep: previousStep,
          values: {
            ...previousState.values,
            [currentStepName]: hasCapturedValues
              ? { ...previousValues, ...capturedFieldValues }
              : previousValues,
          } as { [key in T]: Fields },
        };
      });
      onStepChange?.(previousStep);
      setFieldValues({} as Fields);
    }
  }

  function goToStep(step: T) {
    setStepState((previousState) => ({
      ...previousState,
      currentStep: stepsRef.current[step],
    }));
    onStepChange?.(stepsRef.current[step]);
  }

  function setStepValues(values: Record<T, Fields>) {
    setStepState((previousState) => ({
      ...previousState,
      values: values,
    }));
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
    /**
     * Sets the step values for the step state.
     * This is used to update all values in the step state.
     * @param values The values to set for the all steps.
     * @returns {void}
     */
    setStepValues,
  };
};
