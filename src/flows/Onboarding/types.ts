import { EmploymentCreateParams } from '@/src/client';
import { FlowOptions } from '@/src/flows/types';

export type OnboardingFlowParams = {
  employmentId?: string;
  companyId: string;
  countryCode: string;
  type?: EmploymentCreateParams['type'];
  options?: FlowOptions;
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
