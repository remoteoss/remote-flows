import {
  CreateContractDocumentResponse,
  SignContractDocument,
  SuccessResponse,
} from '@/src/client/types.gen';
import { OnboardingBack } from '@/src/flows/ContractorOnboarding/components/OnboardingBack';
import { OnboardingSubmit } from '@/src/flows/ContractorOnboarding/components/OnboardingSubmit';
import { PricingPlanStep } from '@/src/flows/ContractorOnboarding/components/PricingPlan';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { BasicInformationStep } from '@/src/flows/ContractorOnboarding/components/BasicInformationStep';
import { ContractDetailsStep } from '@/src/flows/ContractorOnboarding/components/ContractDetailsStep';
import { SelectCountryStep } from '@/src/flows/Onboarding/components/SelectCountryStep';
import { FlowOptions, JSFModify } from '@/src/flows/types';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { ContractPreviewStep } from '@/src/flows/ContractorOnboarding/components/ContractPreviewStep';
import { OnboardingInvite } from '@/src/flows/Onboarding/components/OnboardingInvite';
import { ContractReviewButton } from '@/src/flows/ContractorOnboarding/components/ContractReviewButton';
import { EligibilityQuestionnaireStep } from '@/src/flows/ContractorOnboarding/components/EligibilityQuestionnaireStep';
import { ChooseAlternativePlanStep } from '@/src/flows/ContractorOnboarding/components/ChooseAlternativePlanStep';

export type ContractorOnboardingRenderProps = {
  /**
   * The contractor onboarding bag returned by the useContractorOnboarding hook.
   * This bag contains all the methods and properties needed to handle the contractor onboarding flow.
   * @see {@link useContractorOnboarding}
   */
  contractorOnboardingBag: ReturnType<typeof useContractorOnboarding>;
  /**
   * The components used in the contractor onboarding flow.
   * @see {@link BasicInformationStep}
   * @see {@link SelectCountryStep}
   * @see {@link OnboardingBack}
   * @see {@link PricingPlanStep}
   * @see {@link ContractDetailsStep}
   * @see {@link ContractPreviewStep}
   * @see {@link OnboardingSubmit}
   * @see {@link OnboardingBack}
   * @see {@link OnboardingInvite}
   * @see {@link EligibilityQuestionnaireStep}
   */
  components: {
    BasicInformationStep: typeof BasicInformationStep;
    SelectCountryStep: typeof SelectCountryStep;
    BackButton: typeof OnboardingBack;
    SubmitButton: typeof OnboardingSubmit;
    PricingPlanStep: typeof PricingPlanStep;
    ContractDetailsStep: typeof ContractDetailsStep;
    ContractPreviewStep: typeof ContractPreviewStep;
    OnboardingInvite: typeof OnboardingInvite;
    ContractReviewButton: typeof ContractReviewButton;
    EligibilityQuestionnaireStep: typeof EligibilityQuestionnaireStep;
    ChooseAlternativePlanStep: typeof ChooseAlternativePlanStep;
  };
};

export type ContractorOnboardingFlowProps = {
  /**
   * The country code to use for the onboarding.
   */
  countryCode?: string;

  /**
   * The employment id to use for the onboarding.
   */
  employmentId?: string;

  /**
   * Unique reference code for the employment record in a non-Remote system. This optional field links to external data sources.
   * If not provided, it defaults to null. While uniqueness is recommended, it is not strictly enforced within Remote's system.
   */
  externalId?: string;

  /**
   * The steps to skip for the onboarding. We only support skipping the select_country step for now.
   */
  skipSteps?: ['select_country'];

  /**
   * The render prop function with the params passed by the useContractorOnboarding hook and the components available to use for this flow
   */
  render: ({
    contractorOnboardingBag,
    components,
  }: ContractorOnboardingRenderProps) => React.ReactNode;
  /**
   * The options for the contractor onboarding flow.
   */
  options?: Omit<FlowOptions, 'jsfModify'> & {
    /**
     * Products to exclude from the available options in pricing_plan and choose_alternative_plan steps.
     * By default, all products are shown. Use this to hide specific products.
     * @example excludeProducts: ['eor'] // Hide EOR option
     * @example excludeProducts: ['eor', 'cor'] // Hide both EOR and COR
     */
    excludeProducts?: Array<'cm' | 'cm+' | 'cor' | 'eor'>;
    jsfModify?: {
      select_country?: JSFModify;
      basic_information?: JSFModify;
      contract_details?: JSFModify;
      contract_preview?: JSFModify;
      eligibility_questionnaire?: JSFModify;
      choose_alternative_plan?: JSFModify;
      pricing_plan?: JSFModify;
    };
  };

  /**
   * Initial values to pre-populate the form fields.
   * These are flat field values that will be automatically mapped to the correct step.
   * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
   */
  initialValues?: Record<string, unknown>;
};

export type PricingPlanFormPayload = $TSFixMe;

export type PricingPlanResponse = $TSFixMe;

export type ContractorOnboardingContractDetailsFormPayload = {
  services_and_deliverables: string;
  service_duration: {
    expiration_date?: string;
    provisional_start_date: string;
  };
  termination: {
    contractor_notice_period_amount: number;
    company_notice_period_amount: number;
  };
  payment_terms: {
    payment_terms_type: string;
    invoicing_frequency: string;
    compensation_gross_amount: string;
    compensation_currency_code?: string;
    period_unit: string;
  };
};

export type ContractorOnboardingContractDetailsResponse =
  CreateContractDocumentResponse;

export type ContractPreviewFormPayload = SignContractDocument;

export type ContractPreviewResponse = SuccessResponse;

export type EligibilityQuestionnaireFormPayload = {
  control_the_way_contractors_work: 'no' | 'yes';
  previously_hired_contractors_as_employees: 'no' | 'yes';
  treating_contractors_as_employees: 'no' | 'yes';
};

export type EligibilityQuestionnaireResponse = SuccessResponse;
