import { useCallback, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { TimeoffStatus } from '@/src/client';
import { useHeadlessForm } from '@/src/common/useHeadlessForm';
import {
  getTimeOffDecisionError,
  useApproveTimeOffRequest,
  useDeclineTimeOffRequest,
  useGetTimeOffRequest,
  useGetTimeOffRequests,
} from '@/src/flows/TimeOff/api';
import { requestIdSchema } from '@/src/flows/TimeOff/json-schemas/requestId';
import { statusFilterSchema } from '@/src/flows/TimeOff/json-schemas/statusFilter';
import {
  TimeOffApproveOptions,
  TimeOffDeclineOptions,
  TimeOffListStepKeys,
  TimeOffRequestIdFormValues,
  TimeOffStatusFilterFormValues,
  TimeOffStepKeys,
  UseTimeOffListOptions,
  UseTimeOffOptions,
  UseTimeOffRequestOptions,
  UseTimeOffRequestsOptions,
} from '@/src/flows/TimeOff/types';
import {
  LIST_STEPS,
  LIST_STEPS_ARRAY,
  STEPS,
  STEPS_ARRAY,
} from '@/src/flows/TimeOff/utils';
import { useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';

export const useTimeOffRequestReview = ({
  timeOffId,
  isReviewing,
}: {
  timeOffId: string | undefined;
  isReviewing: boolean;
}) => {
  const { timeOffRequest, isLoading, error, refetch } = useTimeOffRequest({
    timeOffId: isReviewing ? timeOffId : undefined,
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

  const declineTimeOffRequestMutation = useDeclineTimeOffRequest();
  const { mutateAsyncOrThrow: declineTimeOffRequestAsync } = mutationToPromise(
    declineTimeOffRequestMutation,
  );

  const decline = useCallback(
    async ({ declineReason }: TimeOffDeclineOptions) => {
      try {
        if (!timeOffId) {
          throw new Error('No time-off request to decline.');
        }
        const response = await declineTimeOffRequestAsync({
          timeOffId,
          declineReason,
        });
        if (!response) {
          throw new Error('The decline returned no time-off request.');
        }
        return response.data.timeoff;
      } catch (error) {
        throw getTimeOffDecisionError(error);
      }
    },
    [declineTimeOffRequestAsync, timeOffId],
  );

  return {
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
     * Declines the time-off request under review. Resolves with the request as the API returns
     * it, so read the outcome from its `status`. Rejects with a `TimeOffDecisionError`.
     */
    decline,
    /**
     * Whether a decision on the time-off request under review is being sent.
     */
    isSubmitting:
      approveTimeOffRequestMutation.isPending ||
      declineTimeOffRequestMutation.isPending,
  };
};

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

  const timeOffRequestReview = useTimeOffRequestReview({
    timeOffId,
    isReviewing: stepState.currentStep.name === 'review',
  });

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
    ...timeOffRequestReview,
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
 * Headless hook powering the time-off list flow.
 */
export const useTimeOffList = ({ pageSize }: UseTimeOffListOptions = {}) => {
  const { stepState, previousStep, goToStep } =
    useStepState<TimeOffListStepKeys>(LIST_STEPS);
  const [status, setStatus] = useState<TimeoffStatus>('requested');
  const [page, setPage] = useState<number>();
  const [timeOffId, setTimeOffId] = useState<string>();

  const { form, handleValidation, onValuesChange } = useHeadlessForm({
    schema: statusFilterSchema,
    strategy: 'buildOnce',
  });

  const {
    timeOffRequests,
    isEmpty,
    currentPage,
    totalPages,
    totalCount,
    isLoading: isLoadingTimeOffRequests,
    error: timeOffRequestsError,
    refetch: refetchTimeOffRequests,
  } = useTimeOffRequests({ status, page, pageSize });

  const timeOffRequestReview = useTimeOffRequestReview({
    timeOffId,
    isReviewing: stepState.currentStep.name === 'review',
  });

  const checkFieldUpdates = useCallback(
    async (values: FieldValues) => {
      await onValuesChange(values);
      const { status: selectedStatus } =
        values as TimeOffStatusFilterFormValues;
      if (selectedStatus) {
        setStatus(selectedStatus);
        setPage(undefined);
      }
    },
    [onValuesChange],
  );

  const hasPreviousPage = Boolean(currentPage && currentPage > 1);
  const hasNextPage = Boolean(
    currentPage && totalPages && currentPage < totalPages,
  );

  return {
    /**
     * Current step state containing the current step and total number of steps.
     */
    stepState,
    /**
     * Every step of the flow, in order.
     */
    steps: LIST_STEPS_ARRAY,
    /**
     * Fields of the status filter.
     */
    fields: form?.fields ?? [],
    /**
     * Validates the status filter values.
     */
    handleValidation,
    /**
     * Lists the requests in the status picked in the status filter, from the first page.
     */
    checkFieldUpdates,
    /**
     * The status the list is filtered by. Starts with `requested`, the requests awaiting a decision.
     */
    status,
    /**
     * The time-off requests of the loaded page, empty until it loads.
     */
    timeOffRequests,
    /**
     * Whether the loaded page holds no time-off request.
     */
    isEmpty,
    /**
     * The page the API returned.
     */
    currentPage,
    /**
     * How many pages the API reports for the current status.
     */
    totalPages,
    /**
     * How many time-off requests the API reports for the current status.
     */
    totalCount,
    /**
     * Whether the requested page is loading for the first time.
     */
    isLoadingTimeOffRequests,
    /**
     * Why the requested page failed to load, or `null`.
     */
    timeOffRequestsError,
    /**
     * Loads the requested page again, e.g. to retry after an error.
     */
    refetchTimeOffRequests,
    /**
     * Whether a page comes before the loaded one.
     */
    hasPreviousPage,
    /**
     * Whether a page comes after the loaded one.
     */
    hasNextPage,
    /**
     * Loads the page before the loaded one.
     */
    previousPage: () => {
      if (currentPage && hasPreviousPage) {
        setPage(currentPage - 1);
      }
    },
    /**
     * Loads the page after the loaded one.
     */
    nextPage: () => {
      if (currentPage && hasNextPage) {
        setPage(currentPage + 1);
      }
    },
    /**
     * Opens the review step for one of the listed time-off requests.
     */
    selectTimeOffRequest: (selectedTimeOffId: string) => {
      setTimeOffId(selectedTimeOffId);
      goToStep('review');
    },
    /**
     * The ID of the time-off request picked from the list.
     */
    timeOffId,
    ...timeOffRequestReview,
    /**
     * Moves back to the list, on the page and status it showed.
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

/**
 * Loads one page of the company's time-off requests, filtered by status.
 */
export const useTimeOffRequests = ({
  status = 'requested',
  page,
  pageSize,
}: UseTimeOffRequestsOptions = {}) => {
  const { data, isLoading, error, refetch } = useGetTimeOffRequests({
    status,
    page,
    page_size: pageSize,
  });
  const timeOffRequests = data?.timeoffs ?? [];

  return {
    /**
     * The time-off requests of the loaded page, empty until it loads.
     */
    timeOffRequests,
    /**
     * Whether the loaded page holds no time-off request.
     */
    isEmpty: Boolean(data) && timeOffRequests.length === 0,
    /**
     * The page the API returned.
     */
    currentPage: data?.current_page,
    /**
     * How many pages the API reports for the current status.
     */
    totalPages: data?.total_pages,
    /**
     * How many time-off requests the API reports for the current status.
     */
    totalCount: data?.total_count,
    /**
     * Whether the requested page is loading for the first time.
     */
    isLoading,
    /**
     * Why the last load failed, or `null`.
     */
    error,
    /**
     * Loads the page again, e.g. to retry after an error.
     */
    refetch,
  };
};
