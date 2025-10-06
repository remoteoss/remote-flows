import { STEPS } from '@/src/flows/ContractorOnboarding/utils';
import { JSONSchemaFormType } from '@/src/flows/types';
import { Step, useStepState } from '@/src/flows/useStepState';

const stepToFormSchemaMap: Record<
  keyof typeof STEPS,
  JSONSchemaFormType | null
> = {
  basic_information: 'employment_basic_information',
};

export const useContractorOnboarding = () => {
  const {
    fieldValues,
    stepState,
    setFieldValues,
    previousStep,
    nextStep,
    goToStep,
  } = useStepState(
    STEPS as Record<keyof typeof STEPS, Step<keyof typeof STEPS>>,
  );

  const formType =
    stepToFormSchemaMap[stepState.currentStep.name] ||
    'employment_basic_information';

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  function onSubmit() {
    console.log('onSubmit');
  }

  return {
    /**
     * Current state of the form fields for the current step.
     */
    fieldValues,

    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,

    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: setFieldValues,

    /**
     * Function to handle going back to the previous step
     * @returns {void}
     */
    back: previousStep,

    /**
     * Function to handle going to the next step
     * @returns {void}
     */
    next: nextStep,

    /**
     * Function to handle going to a specific step
     * @param step The step to go to.
     * @returns {void}
     */
    goTo: goTo,

    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit,
  };
};
