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
    nextStep,
    previousStep,
    stepState,
    fieldValues,
    setFieldValues,
  };
};
