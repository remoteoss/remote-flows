import { Employment } from '@/src/flows/Onboarding/types';
import { Step } from '@/src/flows/useStepState';

type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_details'
  | 'benefits'
  | 'review';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: {
    index: 0,
    name: 'select_country',
  },
  basic_information: { index: 1, name: 'basic_information' },
  contract_details: { index: 2, name: 'contract_details' },
  benefits: { index: 3, name: 'benefits' },
  review: { index: 4, name: 'review' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  contract_details: { index: 1, name: 'contract_details' },
  benefits: { index: 2, name: 'benefits' },
  review: { index: 3, name: 'review' },
} as const;

/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
export const reviewStepAllowedEmploymentStatus: Employment['status'][] = [
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
];

export const disabledInviteButtonEmploymentStatus: Employment['status'][] = [
  'created_awaiting_reserve',
  'invited',
];
