import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { $TSFixMe } from '@/src/types/remoteFlows';

export type ContractorOnboardingRenderProps = {
  /**
   * The contractor onboarding bag returned by the useContractorOnboarding hook.
   * This bag contains all the methods and properties needed to handle the contractor onboarding flow.
   * @see {@link useContractorOnboarding}
   */
  contractorOnboardingBag: ReturnType<typeof useContractorOnboarding>;
  /**
   * The components used in the contractor onboarding flow.
   */
  components: Record<string, React.ComponentType<$TSFixMe>>;
};

export type ContractorOnboardingFlowProps = {
  /**
   * The render prop function with the params passed by the useContractorOnboarding hook and the components available to use for this flow
   */
  render: ({
    contractorOnboardingBag,
    components,
  }: ContractorOnboardingRenderProps) => React.ReactNode;
};
