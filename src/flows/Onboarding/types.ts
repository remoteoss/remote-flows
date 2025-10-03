import {
  EmploymentCreateParams,
  Employment as EmploymentResponse,
} from '@/src/client';
import { FlowOptions, JSFModify } from '@/src/flows/types';

export type OnboardingFlowParams = {
  /**
   * The country code to use for the onboarding.
   */
  countryCode?: string;
  /**
   * The employment id to use for the onboarding.
   */
  employmentId?: string;
  /**
   * The company id to use for the onboarding.
   */
  companyId: string;
  /**
   * Unique reference code for the employment record in a non-Remote system. This optional field links to external data sources.
   * If not provided, it defaults to null. While uniqueness is recommended, it is not strictly enforced within Remote's system.
   */
  externalId?: string;
  /**
   * Initial values to pre-populate the form fields.
   * These are flat field values that will be automatically mapped to the correct step.
   * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
   */
  initialValues?: Record<string, unknown>;
  /**
   * The steps to skip for the onboarding. We only support skipping the select_country step for now.
   */
  skipSteps?: ['select_country'];
  /**
   * The type of employment to use for the onboarding. Employee or contractor.
   */
  type?: EmploymentCreateParams['type'];
  /**
   * The options to use for the onboarding.
   */
  options?: Omit<FlowOptions, 'jsfModify'> & {
    jsfModify?: {
      select_country?: JSFModify;
      basic_information?: JSFModify;
      contract_details?: JSFModify;
      benefits?: JSFModify;
    };
  };
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
  | 'referred'
  | null;
