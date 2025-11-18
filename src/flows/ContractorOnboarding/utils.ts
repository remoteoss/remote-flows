import { Step } from '@/src/flows/useStepState';

type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_details'
  | 'contract_preview'
  | 'pricing_plan'
  | 'review';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: { index: 0, name: 'select_country' },
  basic_information: { index: 1, name: 'basic_information' },
  contract_details: { index: 2, name: 'contract_details' },
  pricing_plan: { index: 3, name: 'pricing_plan' },
  contract_preview: { index: 4, name: 'contract_preview' },
  review: { index: 5, name: 'review' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  contract_details: { index: 1, name: 'contract_details' },
  pricing_plan: { index: 2, name: 'pricing_plan' },
  contract_preview: { index: 3, name: 'contract_preview' },
  review: { index: 4, name: 'review' },
} as const;
