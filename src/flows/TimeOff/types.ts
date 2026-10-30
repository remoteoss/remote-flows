import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Timeoff } from '@/src/client';
import { useTimeOff } from '@/src/flows/TimeOff/hooks';

export type TimeOffStepKeys = 'request_id' | 'review';

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

export type UseTimeOffRequestOptions = {
  /**
   * The time-off request to load. Nothing loads while it is blank.
   */
  timeOffId?: string;
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

type TimeOffButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
>;

export type TimeOffRenderProps = {
  timeOffBag: ReturnType<typeof useTimeOff>;
  components: {
    RequestIdStep: React.ComponentType;
    NextButton: React.ComponentType<TimeOffButtonProps>;
    ReviewStep: React.ComponentType<TimeOffReviewStepProps>;
    RetryButton: React.ComponentType<TimeOffButtonProps>;
    BackButton: React.ComponentType<TimeOffButtonProps>;
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
