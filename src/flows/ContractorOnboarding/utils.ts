import { Step } from '@/src/flows/useStepState';

type StepKeys = 'select_country' | 'basic_information';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: { index: 0, name: 'select_country' },
  basic_information: { index: 1, name: 'basic_information' },
} as const;
