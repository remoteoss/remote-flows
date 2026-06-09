import { FlowOptions } from '@/src/flows/types';
import { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';

// Step component prop types are intentionally empty for this scaffold — PBYR-4044 will
// replace these with typed props once each step component is implemented.
type StepComponentType = React.ComponentType<Record<string, never>>;

export type PayrollAdminOnboardingRenderProps = {
  adminBag: ReturnType<typeof usePayrollAdminOnboarding>;
  components: {
    SelectCountryStep: StepComponentType;
    ContractDetailsStep: StepComponentType;
    AdministrativeDetailsStep: StepComponentType;
    InvitationStep: StepComponentType;
    SubmitButton: StepComponentType;
    BackButton: StepComponentType;
  };
};

export type PayrollAdminOnboardingFlowProps = {
  /** UUID of the company. */
  companyId: string;
  /** UUID of the GP-enabled legal entity (required for GP employment creation). */
  legalEntityId: string;
  /** Optional. Pre-select country and skip country selection. */
  countryCode?: string;
  /** Optional. Resume an existing in-progress GP employment. */
  employmentId?: string;
  /** Optional. Pre-populate form fields. Server data overrides these. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollAdminOnboardingRenderProps) => React.ReactNode;
};
