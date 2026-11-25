import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import {
  DeclineTimeoffParams,
  Employment,
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
   * How many requests a page of the list holds, passed to the API as given. The API documents no default or maximum.
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
   * How many requests a page holds, passed to the API as given. The API documents no default or maximum.
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
   * time off, as listed by the company managers endpoint, or `null`. Not sent when approving a
   * cancellation request, whose route takes no body.
   */
  approverId: NullableApproverId;
};

export type TimeOffDeclineOptions = {
  /**
   * Sent unchanged as `decline_reason`, which the API requires: why the request, or its
   * cancellation request, is declined, or `null` to give no reason.
   */
  declineReason: DeclineTimeoffParams['decline_reason'];
};

/**
 * One detail of a time-off request, labelled and formatted for display. Read details by `name`:
 * which ones a request has depends on its status and data, and new names can be added.
 */
export type TimeOffRequestDetail = {
  name:
    | 'status'
    | 'team_member'
    | 'decline_reason'
    | 'cancelled_on'
    | 'leave_policy'
    | 'start_date'
    | 'end_date'
    | 'duration'
    | 'notes'
    | 'requested_on'
    | 'last_edited_on'
    | 'created_by'
    | 'edit_reason'
    | 'approved_by'
    | 'approved_on'
    | 'cancel_reason'
    | 'cancel_decline_reason';
  label: string;
  value: string;
};

export type TimeOffTeamMember = Pick<Employment, 'full_name' | 'type'>;

export type CompanyManagerNames = Partial<Record<string, string>>;

/**
 * Who entered a time-off request: a company manager (`Employer`), or the team member themselves
 * (`Employee`, or `Contractor` on a contractor employment).
 */
export type TimeOffCreator = {
  name: string;
  role: 'Employer' | 'Employee' | 'Contractor';
};

/**
 * The names behind a time-off request. Each one is `undefined` until the data it comes from
 * loads, and stays so when it can't be loaded, e.g. for a token without the scope to read it.
 */
export type TimeOffRequestPeople = {
  /**
   * The full name of the team member the time off is for, from their employment.
   */
  teamMemberName?: string;
  /**
   * Who entered the request, from its `created_by_id`. `undefined` when no creator is recorded,
   * e.g. for automatic time off or time off entered by Remote.
   */
  createdBy?: TimeOffCreator;
  /**
   * The name of the company manager who approved the request, for an `approved` or `taken`
   * request whose `approver_id` is one of the company managers.
   */
  approverName?: string;
};

export type TimeOffReviewStepProps = {
  /**
   * Replaces the default rendering of the loaded request's details. Nothing renders until the
   * request is loaded: use `timeOffBag.isLoading` and `timeOffBag.timeOffRequestError` for the other states.
   */
  render?: (
    props: TimeOffRequestPeople & {
      timeOffRequest: TimeOffRequest;
      details: TimeOffRequestDetail[];
    },
  ) => React.ReactNode;
  /**
   * Rendered under the loaded request's details, e.g. actions on the request.
   */
  children?: React.ReactNode;
};

/**
 * One listed time-off request, with what a row of the list shows.
 */
export type TimeOffListItem = TimeOffRequestPeople & {
  timeOffRequest: TimeOffRequest;
  /**
   * Every detail of the request, labelled and formatted for display.
   */
  details: TimeOffRequestDetail[];
  /**
   * The details a row of the list shows by default: team member, type, status, dates and duration.
   */
  listedDetails: TimeOffRequestDetail[];
  /**
   * Whether the request awaits a decision, so it can be approved or declined: it is `requested`,
   * or `cancel_requested` and the decision is on its cancellation.
   */
  canDecide: boolean;
};

export type TimeOffListStepProps = {
  /**
   * Replaces the default content of each listed request, rendered before its actions. Nothing
   * renders until a page is loaded: use `timeOffListBag.isLoadingTimeOffRequests`,
   * `timeOffListBag.isEmpty` and `timeOffListBag.timeOffRequestsError` for the other states.
   */
  render?: (item: TimeOffListItem) => React.ReactNode;
  /**
   * Replaces the actions rendered at the end of each listed request: `ViewButton`, then
   * `DeclineButton` and `ApproveButton` when the request `canDecide`, with no decline reason and a
   * `null` approver. `ViewButton`, `ApproveButton` and `DeclineButton` rendered here act on that request.
   * Without `ViewButton`, the request opens for review only through
   * `timeOffListBag.selectTimeOffRequest`.
   */
  renderActions?: (item: TimeOffListItem) => React.ReactNode;
  /**
   * Replaces the whole markup of the list: only what it returns for each listed request renders,
   * one after the other, with no list or row element around it. `ViewButton`, `ApproveButton` and
   * `DeclineButton` rendered here act on that request.
   */
  renderItem?: (item: TimeOffListItem) => React.ReactNode;
};

type TimeOffButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
>;

export type TimeOffApproveButtonProps = Omit<TimeOffButtonProps, 'onError'> &
  TimeOffApproveOptions & {
    /**
     * Called with the request as the API returns it once approved, or as it is reloaded once its
     * cancellation is approved. Read the outcome from its `status` rather than assuming one.
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
     * Called with the request as the API returns it once declined, or as it is reloaded once its
     * cancellation is declined. Read the outcome from its `status` rather than assuming one.
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
    ViewButton: React.ComponentType<TimeOffButtonProps>;
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
