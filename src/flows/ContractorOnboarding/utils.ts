import { Step } from '@/src/flows/useStepState';

type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'pricing_plan'
  | 'contract_options';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: { index: 0, name: 'select_country' },
  basic_information: { index: 1, name: 'basic_information' },
  pricing_plan: { index: 2, name: 'pricing_plan' },
  contract_options: { index: 3, name: 'contract_options' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  pricing_plan: { index: 1, name: 'pricing_plan' },
  contract_options: { index: 2, name: 'contract_options' },
} as const;
