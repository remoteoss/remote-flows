import { Step } from '@/src/flows/useStepState';

type StepKeys =
  | 'select_country'
  | 'review';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: { index: 0, name: 'select_country' },
} as const;
