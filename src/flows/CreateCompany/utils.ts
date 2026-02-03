import { Step } from '@/src/flows/useStepState';

type StepKeys =
  | 'select_country'
  | 'address_details';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: { index: 0, name: 'select_country' },
  address_details: { index: 1, name: 'address_details' },
} as const;
