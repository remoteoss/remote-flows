import { Step } from '@/src/flows/useStepState';
import { TimeOffStepKeys } from '@/src/flows/TimeOff/types';

export const STEPS: Record<TimeOffStepKeys, Step<TimeOffStepKeys>> = {
  time_off: { index: 0, name: 'time_off' },
};

const STEP_LABELS: Record<TimeOffStepKeys, string> = {
  time_off: 'Time Off',
};

export const STEPS_ARRAY = Object.values(STEPS).map((step) => ({
  ...step,
  label: STEP_LABELS[step.name],
}));
