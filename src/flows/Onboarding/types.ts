import {
  EmploymentCreateParams,
  Employment as EmploymentResponse,
} from '@/src/client';
import { BasicInformationStep } from '@/src/flows/Onboarding/components/BasicInformationStep';
import { OnboardingBack } from '@/src/flows/Onboarding/components/OnboardingBack';
import { OnboardingInvite } from '@/src/flows/Onboarding/components/OnboardingInvite';
import { ContractDetailsStep } from '@/src/flows/Onboarding/components/ContractDetailsStep';
import { OnboardingSubmit } from '@/src/flows/Onboarding/components/OnboardingSubmit';
import { BenefitsStep } from '@/src/flows/Onboarding/components/BenefitsStep';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { FlowOptions, JSFModifyNext } from '@/src/flows/types';
import { SelectCountryStep } from '@/src/flows/Onboarding/components/SelectCountryStep';
import { ReviewStep } from '@/src/flows/Onboarding/components/ReviewStep';
import { SaveDraftButton } from '@/src/flows/Onboarding/components/SaveDraftButton';

export type OnboardingRenderProps = {
  /**
   * The onboarding bag returned by the useOnboarding hook.
   * This bag contains all the methods and properties needed to handle the onboarding flow.
   * @see {@link useOnboarding}
   */
  onboardingBag: ReturnType<typeof useOnboarding>;
  /**
   * The components used in the onboarding flow.
   * This includes different steps, submit button, back button.
   * @see {@link BasicInformationStep}
   * @see {@link ContractDetailsStep}
   * @see {@link OnboardingSubmit}
   * @see {@link OnboardingBack}
   * @see {@link OnboardingInvite}
   * @see {@link BenefitsStep}
   * @see {@link OnboardingCreateReserve}
   * @see {@link InvitationSection}
   * @see {@link SelectCountryStep}
   * @see {@link ReviewStep}
   * @see {@link SaveDraftButton}
   */
  components: {
    SubmitButton: typeof OnboardingSubmit;
    BackButton: typeof OnboardingBack;
    BasicInformationStep: typeof BasicInformationStep;
    OnboardingInvite: typeof OnboardingInvite;
    ContractDetailsStep: typeof ContractDetailsStep;
    BenefitsStep: typeof BenefitsStep;
    SelectCountryStep: typeof SelectCountryStep;
    ReviewStep: typeof ReviewStep;
    SaveDraftButton: typeof SaveDraftButton;
  };
};

export type OnboardingFlowProps = {
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
      select_country?: JSFModifyNext;
      basic_information?: JSFModifyNext;
      contract_details?: JSFModifyNext;
      benefits?: JSFModifyNext;
    };
    /**
     * The json schema version to use for the onboarding by country.
     * This is used to override the json schema version for the onboarding by country.
     * the old jsonSchemaVersion is not working well at the moment, don't use it for now.
     */
    jsonSchemaVersionByCountry?: {
      [countryCode: string]: {
        employment_basic_information?: number;
        contract_details?: number;
      };
    };
  };
  /**
   * The render prop function with the params passed by the useOnboarding hook and the components available to use for this flow
   */
  render: ({
    onboardingBag,
    components,
  }: OnboardingRenderProps) => React.ReactNode;
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
