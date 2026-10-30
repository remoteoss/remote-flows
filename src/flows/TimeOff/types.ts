import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import {
  DeclineTimeoffParams,
  NullableApproverId,
  Timeoff,
  TimeoffErrorResponse,
  TimeoffStatus,
} from '@/src/client';
import { useTimeOff, useTimeOffList } from '@/src/flows/TimeOff/hooks';

export type TimeOffStepKeys = 'request_id' | 'review';

export type TimeOffListStepKeys = 'list' | 'review';

/**
 * Values the request ID step collects.
 */
export type TimeOffRequestIdFormValues = {
  timeoff_id?: string;
};

export type UseTimeOffOptions = {
  /**
   * The time-off request to open, when the host already knows it.
   */
  timeOffId?: string;
};

/**
 * Values the status filter of the time-off list collects.
 */
export type TimeOffStatusFilterFormValues = {
  status?: TimeoffStatus;
};

export type UseTimeOffListOptions = {
  /**
   * How many requests a page of the list holds. The API documents `1` to `100` and uses `20` when omitted.
   */
  pageSize?: number;
};

export type UseTimeOffRequestOptions = {
  /**
   * The time-off request to load. Nothing loads while it is blank.
   */
  timeOffId?: string;
};

export type UseTimeOffRequestsOptions = {
  /**
   * Only lists requests in this status. Defaults to `requested`, the requests awaiting a decision.
   */
  status?: TimeoffStatus;
  /**
   * The page to load, from `1`. The API returns the first page when omitted.
   */
  page?: number;
  /**
   * How many requests a page holds. The API documents `1` to `100` and uses `20` when omitted.
   */
  pageSize?: number;
};

/**
 * A time-off request as `GET /v1/timeoff/{id}` returns it.
 */
export type TimeOffRequest = Timeoff;

/**
 * Why a time-off request failed to load: `not_found` when it doesn't exist or isn't visible to
 * the caller, `unauthorized` when the token is rejected, `request_failed` for anything else.
 */
export type TimeOffRequestError = {
  reason: 'not_found' | 'unauthorized' | 'request_failed';
  status: number | undefined;
};

/**
 * Why a page of time-off requests failed to load: `unauthorized` when the token is rejected,
 * `rejected` when the API refuses the status or paging values with a `400` or `422`,
 * `request_failed` for anything else.
 */
export type TimeOffRequestsError = {
  reason: 'unauthorized' | 'rejected' | 'request_failed';
  status: number | undefined;
};

/**
 * Why a decision on a time-off request failed: `not_found` when it doesn't exist or isn't visible
 * to the caller, `unauthorized` when the token is rejected, `rejected` when the API refuses the
 * decision with a `422` (its `message` and `fieldErrors` say why), `request_failed` for anything else.
 */
export type TimeOffDecisionError = {
  reason: 'not_found' | 'unauthorized' | 'rejected' | 'request_failed';
  status: number | undefined;
  message: string;
  fieldErrors: TimeoffErrorResponse['field_errors'];
};

export type TimeOffApproveOptions = {
  /**
   * Sent unchanged as `approver_id`, which the API requires: the `id` of a user allowed to approve
   * time off, as listed by the company managers endpoint, or `null`.
   */
  approverId: NullableApproverId;
};

export type TimeOffDeclineOptions = {
  /**
   * Sent unchanged as `decline_reason`, which the API requires: why the request is declined, or
   * `null` to give no reason.
   */
  declineReason: DeclineTimeoffParams['decline_reason'];
};

/**
 * One detail of a time-off request, labelled and formatted for display.
 */
export type TimeOffRequestDetail = {
  name:
    | 'leave_policy'
    | 'status'
    | 'start_date'
    | 'end_date'
    | 'duration'
    | 'notes'
    | 'cancel_reason';
  label: string;
  value: string;
};

export type TimeOffReviewStepProps = {
  /**
   * Replaces the default rendering of the loaded request's details. Nothing renders until the
   * request is loaded: use `timeOffBag.isLoading` and `timeOffBag.timeOffRequestError` for the other states.
   */
  render?: (props: {
    timeOffRequest: TimeOffRequest;
    details: TimeOffRequestDetail[];
  }) => React.ReactNode;
  /**
   * Rendered under the loaded request's details, e.g. actions on the request.
   */
  children?: React.ReactNode;
};

export type TimeOffListStepProps = {
  /**
   * Replaces the default content of each listed request, which stays the control that opens it
   * for review. Nothing renders until a page is loaded: use `timeOffListBag.isLoadingTimeOffRequests`,
   * `timeOffListBag.isEmpty` and `timeOffListBag.timeOffRequestsError` for the other states.
   */
  render?: (props: {
    timeOffRequest: TimeOffRequest;
    details: TimeOffRequestDetail[];
  }) => React.ReactNode;
};

type TimeOffButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
>;

export type TimeOffApproveButtonProps = Omit<TimeOffButtonProps, 'onError'> &
  TimeOffApproveOptions & {
    /**
     * Called with the request as the API returns it once approved. Read the outcome from its
     * `status` rather than assuming `approved`.
     */
    onSuccess?: (timeOffRequest: TimeOffRequest) => void | Promise<void>;
    /**
     * Called when the approval fails. The button is enabled again so the user can retry.
     */
    onError?: (error: TimeOffDecisionError) => void;
  };

export type TimeOffDeclineButtonProps = Omit<TimeOffButtonProps, 'onError'> &
  TimeOffDeclineOptions & {
    /**
     * Called with the request as the API returns it once declined. Read the outcome from its
     * `status` rather than assuming `declined`.
     */
    onSuccess?: (timeOffRequest: TimeOffRequest) => void | Promise<void>;
    /**
     * Called when the decline fails. The button is enabled again so the user can retry.
     */
    onError?: (error: TimeOffDecisionError) => void;
  };

export type TimeOffRenderProps = {
  timeOffBag: ReturnType<typeof useTimeOff>;
  components: {
    RequestIdStep: React.ComponentType;
    NextButton: React.ComponentType<TimeOffButtonProps>;
    ReviewStep: React.ComponentType<TimeOffReviewStepProps>;
    RetryButton: React.ComponentType<TimeOffButtonProps>;
    BackButton: React.ComponentType<TimeOffButtonProps>;
    ApproveButton: React.ComponentType<TimeOffApproveButtonProps>;
    DeclineButton: React.ComponentType<TimeOffDeclineButtonProps>;
  };
};

export type TimeOffFlowProps = {
  /**
   * The time-off request to open, when the host already knows it. Sourcing it is yours — a
   * route param, the row the user clicked; the request ID step starts filled with it.
   */
  timeOffId?: string;
  render: (props: TimeOffRenderProps) => React.ReactNode;
};

export type TimeOffListRenderProps = {
  timeOffListBag: ReturnType<typeof useTimeOffList>;
  components: {
    StatusFilter: React.ComponentType;
    ListStep: React.ComponentType<TimeOffListStepProps>;
    ListRetryButton: React.ComponentType<TimeOffButtonProps>;
    PreviousPageButton: React.ComponentType<TimeOffButtonProps>;
    NextPageButton: React.ComponentType<TimeOffButtonProps>;
    ReviewStep: React.ComponentType<TimeOffReviewStepProps>;
    RetryButton: React.ComponentType<TimeOffButtonProps>;
    BackButton: React.ComponentType<TimeOffButtonProps>;
    ApproveButton: React.ComponentType<TimeOffApproveButtonProps>;
    DeclineButton: React.ComponentType<TimeOffDeclineButtonProps>;
  };
};

export type TimeOffListFlowProps = UseTimeOffListOptions & {
  render: (props: TimeOffListRenderProps) => React.ReactNode;
};
