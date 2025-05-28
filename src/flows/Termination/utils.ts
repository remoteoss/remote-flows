import { Step } from '@/src/flows/useStepState';

export type StepTerminationKeys =
  | 'employee_communication'
  | 'termination_details'
  | 'paid_time_off'
  | 'additional_information';

export const STEPS: Record<StepTerminationKeys, Step<StepTerminationKeys>> = {
  employee_communication: { index: 0, name: 'employee_communication' },
  termination_details: { index: 1, name: 'termination_details' },
  paid_time_off: { index: 2, name: 'paid_time_off' },
  additional_information: { index: 3, name: 'additional_information' },
} as const;
