import { FlowOptions, GPStepCallbacks } from '@/src/flows/types';
import { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';

export type { GPStepCallbacks as GPAdminStepCallbacks };

export type PayrollAdminOnboardingRenderProps = {
  adminBag: ReturnType<typeof usePayrollAdminOnboarding>;
  components: {
    SelectCountryStep: React.ComponentType<GPStepCallbacks>;
    ContractDetailsStep: React.ComponentType<GPStepCallbacks>;
    AdministrativeDetailsStep: React.ComponentType<GPStepCallbacks>;
    InvitationStep: React.ComponentType<
      Pick<GPStepCallbacks, 'onSuccess' | 'onError'> & {
        children?: React.ReactNode;
      }
    >;
    SubmitButton: React.ComponentType<
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: React.ReactNode;
      }
    >;
    BackButton: React.ComponentType<
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: React.ReactNode;
      }
    >;
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
