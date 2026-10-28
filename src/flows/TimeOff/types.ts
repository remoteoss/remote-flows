import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useTimeOff } from '@/src/flows/TimeOff/hooks';

export type TimeOffStepKeys = 'request_id' | 'time_off';

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

export type TimeOffRenderProps = {
  timeOffBag: ReturnType<typeof useTimeOff>;
  components: {
    RequestIdStep: React.ComponentType;
    NextButton: React.ComponentType<
      PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
    >;
    TimeOffStep: React.ComponentType;
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
