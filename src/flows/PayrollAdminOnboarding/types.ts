import { FlowOptions } from '@/src/flows/types';
import { usePayrollAdminOnboarding } from '@/src/flows/PayrollAdminOnboarding/hooks';
import type { FieldError } from '@/src/lib/mutations';

export type GPAdminStepCallbacks = {
  onSubmit?: (payload: Record<string, unknown>) => void | Promise<void>;
  onSuccess?: (data: unknown) => void | Promise<void>;
  onError?: (args: {
    error: Error;
    rawError: Record<string, unknown>;
    fieldErrors: FieldError[];
  }) => void;
};

export type PayrollAdminOnboardingRenderProps = {
  adminBag: ReturnType<typeof usePayrollAdminOnboarding>;
  components: {
    SelectCountryStep: React.ComponentType<GPAdminStepCallbacks>;
    ContractDetailsStep: React.ComponentType<GPAdminStepCallbacks>;
    AdministrativeDetailsStep: React.ComponentType<GPAdminStepCallbacks>;
    InvitationStep: React.ComponentType<
      Pick<GPAdminStepCallbacks, 'onSuccess' | 'onError'> & {
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
