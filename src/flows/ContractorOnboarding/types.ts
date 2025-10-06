import { OnboardingBack } from '@/src/flows/ContractorOnboarding/components/OnboardingBack';
import { OnboardingSubmit } from '@/src/flows/ContractorOnboarding/components/OnboardingSubmit';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { BasicInformationStep } from '@/src/flows/Onboarding/components/BasicInformationStep';
import { SelectCountryStep } from '@/src/flows/Onboarding/components/SelectCountryStep';
import { FlowOptions, JSFModify } from '@/src/flows/types';

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
   */
  components: {
    BasicInformationStep: typeof BasicInformationStep;
    SelectCountryStep: typeof SelectCountryStep;
    BackButton: typeof OnboardingBack;
    SubmitButton: typeof OnboardingSubmit;
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
    jsfModify?: {
      select_country?: JSFModify;
      basic_information?: JSFModify;
    };
  };

  /**
   * Initial values to pre-populate the form fields.
   * These are flat field values that will be automatically mapped to the correct step.
   * Server data will override these values. This happens when you pass employmentId and the server returns an employment object.
   */
  initialValues?: Record<string, unknown>;
};
