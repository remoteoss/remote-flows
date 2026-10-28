import { useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import {
  getTimeOffDecisionError,
  useApproveTimeOffRequest,
  useGetTimeOffRequest,
} from '@/src/flows/TimeOff/api';
import { requestIdSchema } from '@/src/flows/TimeOff/json-schemas/requestId';
import {
  TimeOffApproveOptions,
  TimeOffRequestIdFormValues,
  TimeOffStepKeys,
  UseTimeOffOptions,
  UseTimeOffRequestOptions,
} from '@/src/flows/TimeOff/types';
import { STEPS, STEPS_ARRAY } from '@/src/flows/TimeOff/utils';
import { useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';

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

  const { timeOffRequest, isLoading, error, refetch } = useTimeOffRequest({
    timeOffId: stepState.currentStep.name === 'review' ? timeOffId : undefined,
  });

  const approveTimeOffRequestMutation = useApproveTimeOffRequest();
  const { mutateAsyncOrThrow: approveTimeOffRequestAsync } = mutationToPromise(
    approveTimeOffRequestMutation,
  );

  const approve = useCallback(
    async ({ approverId }: TimeOffApproveOptions) => {
      try {
        if (!timeOffId) {
          throw new Error('No time-off request to approve.');
        }
        const response = await approveTimeOffRequestAsync({
          timeOffId,
          approverId,
        });
        if (!response) {
          throw new Error('The approval returned no time-off request.');
        }
        return response.data.timeoff;
      } catch (error) {
        throw getTimeOffDecisionError(error);
      }
    },
    [approveTimeOffRequestAsync, timeOffId],
  );

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
     * The time-off request under review, loaded once the flow reaches the review step.
     */
    timeOffRequest,
    /**
     * Whether the time-off request under review is loading for the first time.
     */
    isLoading,
    /**
     * Why the time-off request under review failed to load, or `null`.
     */
    timeOffRequestError: error,
    /**
     * Loads the time-off request under review again, e.g. to retry after an error.
     */
    refetchTimeOffRequest: refetch,
    /**
     * Approves the time-off request under review. Resolves with the request as the API returns
     * it, so read the outcome from its `status`. Rejects with a `TimeOffDecisionError`.
     */
    approve,
    /**
     * Whether a decision on the time-off request under review is being sent.
     */
    isSubmitting: approveTimeOffRequestMutation.isPending,
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

/**
 * Loads one time-off request by its ID, e.g. `timeOffBag.timeOffId`.
 */
export const useTimeOffRequest = ({ timeOffId }: UseTimeOffRequestOptions) => {
  const { data, isLoading, error, refetch } = useGetTimeOffRequest(timeOffId);

  return {
    /**
     * The loaded time-off request.
     */
    timeOffRequest: data,
    /**
     * Whether the time-off request is loading for the first time.
     */
    isLoading,
    /**
     * Why the last load failed, or `null`.
     */
    error,
    /**
     * Loads the time-off request again, e.g. to retry after an error.
     */
    refetch,
  };
};
