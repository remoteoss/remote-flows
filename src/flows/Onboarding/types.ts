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
  | null;

type MetaValues = {
  label?: string;
  prettyValue?: string | boolean;
  inputType?: string;
  desiredCurrency?: string;
};

export type Meta = Record<string, MetaValues>;
