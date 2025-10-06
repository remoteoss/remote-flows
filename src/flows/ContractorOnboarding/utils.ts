import { Step } from '@/src/flows/useStepState';

type StepKeys = 'basic_information';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  basic_information: { index: 0, name: 'basic_information' },
} as const;
