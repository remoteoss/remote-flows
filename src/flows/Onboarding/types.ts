import { EmploymentCreateParams } from '@/src/client';
import { FlowOptions } from '@/src/flows/types';

export type OnboardingFlowParams = {
  employmentId?: string;
  countryCode: string;
  type?: EmploymentCreateParams['type'];
  options?: FlowOptions;
};
