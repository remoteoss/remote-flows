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
    Back: typeof OnboardingBack;
    Submit: typeof OnboardingSubmit;
  };
};

export type ContractorOnboardingFlowProps = {
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
};
