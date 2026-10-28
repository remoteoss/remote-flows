import { Step } from '@/src/flows/useStepState';
import { TimeOffStepKeys } from '@/src/flows/TimeOff/types';

export const STEPS: Record<TimeOffStepKeys, Step<TimeOffStepKeys>> = {
  request_id: { index: 0, name: 'request_id' },
  time_off: { index: 1, name: 'time_off' },
};

const STEP_LABELS: Record<TimeOffStepKeys, string> = {
  request_id: 'Request ID',
  time_off: 'Time Off',
};

export const STEPS_ARRAY = Object.values(STEPS).map((step) => ({
  ...step,
  label: STEP_LABELS[step.name],
}));
