import { useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import { requestIdSchema } from '@/src/flows/TimeOff/json-schemas/requestId';
import {
  TimeOffRequestIdFormValues,
  TimeOffStepKeys,
  UseTimeOffOptions,
} from '@/src/flows/TimeOff/types';
import { STEPS, STEPS_ARRAY } from '@/src/flows/TimeOff/utils';
import { useStepState } from '@/src/flows/useStepState';

/**
 * Headless hook powering the time-off flow.
 */
export const useTimeOff = ({
  timeOffId: initialTimeOffId,
}: UseTimeOffOptions = {}) => {
  const {
    stepState,
    fieldValues,
    setFieldValues,
    nextStep,
    previousStep,
    goToStep,
  } = useStepState<TimeOffStepKeys, TimeOffRequestIdFormValues>(STEPS);

  const { form, handleValidation, onValuesChange } = useHeadlessForm({
    schema: requestIdSchema,
    strategy: 'buildOnce',
  });

  const timeOffId = (
    stepState.values?.request_id?.timeoff_id ?? initialTimeOffId
  )?.trim();
  const enteredTimeOffId = (fieldValues.timeoff_id ?? timeOffId)?.trim();

  const checkFieldUpdates = useCallback(
    async (values: FieldValues) => {
      setFieldValues(values);
      await onValuesChange(values);
    },
    [setFieldValues, onValuesChange],
  );

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
     * Fields of the request ID step.
     */
    fields: form?.fields ?? [],
    /**
     * Validates the request ID step values.
     */
    handleValidation,
    /**
     * Keeps the flow in sync with the request ID step values.
     */
    checkFieldUpdates,
    /**
     * The time-off request ID stored when leaving the request ID step, or the one the host supplied.
     */
    timeOffId,
    /**
     * Whether the request ID step holds a non-blank ID, so the flow can move on.
     */
    hasRequestId: Boolean(enteredTimeOffId),
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
