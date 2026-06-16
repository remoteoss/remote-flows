import { FlowOptions } from '@/src/flows/types';
import { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';

// Step component prop types are intentionally empty for this scaffold — PBYR-4045 will
// replace these with typed props once each step component is implemented.
type StepComponentType = React.ComponentType<Record<string, never>>;

export type PayrollEmployeeOnboardingRenderProps = {
  employeeBag: ReturnType<typeof usePayrollEmployeeOnboarding>;
  components: {
    PersonalDetailsStep: StepComponentType;
    HomeAddressStep: StepComponentType;
    /** Check employeeBag.selfOnboardingSubsteps to determine if bank account is required. */
    BankAccountStep: StepComponentType;
    SubmitButton: StepComponentType;
    BackButton: StepComponentType;
  };
};

export type PayrollEmployeeOnboardingFlowProps = {
  /** UUID of the employment, scoped to the employee token. */
  employmentId: string;
  /** Optional. Pre-populate form fields. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollEmployeeOnboardingRenderProps) => React.ReactNode;
};
