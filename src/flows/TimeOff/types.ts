import React from 'react';
import { useTimeOff } from '@/src/flows/TimeOff/hooks';

export type TimeOffStepKeys = 'time_off';

export type TimeOffRenderProps = {
  timeOffBag: ReturnType<typeof useTimeOff>;
  components: {
    TimeOffStep: React.ComponentType;
  };
};

export type TimeOffFlowProps = {
  render: (props: TimeOffRenderProps) => React.ReactNode;
};
