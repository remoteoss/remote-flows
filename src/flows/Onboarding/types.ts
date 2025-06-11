import {
  EmploymentCreateParams,
  Employment as EmploymentResponse,
} from '@/src/client';
import { FlowOptions } from '@/src/flows/types';

export type OnboardingFlowParams = {
  countryCode?: string;
  employmentId?: string;
  companyId: string;
  type?: EmploymentCreateParams['type'];
  options?: FlowOptions;
};

export type SelectCountryFormPayload = {
  countryCode: string;
};

export type SelectCountrySuccess = {
  countryCode: string;
};

export type BasicInformationFormPayload = {
  name: string;
  email: string;
  work_email: string;
  job_title: string;
  tax_servicing_countries: string[];
  tax_job_category: string;
  department: {
    id: string;
    name?: string;
  };
  provisional_start_date: string;
  has_seniority_date: 'yes' | 'no';
  manager: {
    id: string;
  };
  seniority_date: string;
};

export type BenefitsFormPayload = Record<
  string,
  { value: string; filter?: string }
>;

export type ContractDetailsFormPayload = Record<string, unknown>;

export type CreditRiskStatus =
  | 'not_started'
  | 'ready'
  | 'in_progress'
  | 'referred'
  | 'fail'
  | 'deposit_required'
  | 'no_deposit_required';

export type Employment = EmploymentResponse & {
  /**
   * Most updated termination date for the offboarding. This date is subject to change through the offboarding process even after it is finalized.
   */
  termination_date?: string | null;
};

export type CreditRiskState =
  | 'deposit_required'
  | 'deposit_required_successful'
  | 'invite'
  | 'invite_successful'
  | null;
