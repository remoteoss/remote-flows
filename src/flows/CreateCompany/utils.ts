import { Step } from '@/src/flows/useStepState';

type StepKeys = 'company_basic_information' | 'address_details';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  company_basic_information: { index: 0, name: 'company_basic_information' },
  address_details: { index: 1, name: 'address_details' },
} as const;
