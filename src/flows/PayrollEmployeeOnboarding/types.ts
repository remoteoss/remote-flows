import { FlowOptions, GPStepCallbacks } from '@/src/flows/types';
import { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';

export type { GPStepCallbacks as GPEmployeeStepCallbacks };

type StepComponentType = React.ComponentType<GPStepCallbacks>;

export type PayrollEmployeeOnboardingRenderProps = {
  employeeBag: ReturnType<typeof usePayrollEmployeeOnboarding>;
  components: {
    PersonalDetailsStep: StepComponentType;
    HomeAddressStep: StepComponentType;
    /** Check employeeBag.selfOnboardingSubsteps for 'employee_provides_bank_details' before rendering. */
    BankAccountStep: StepComponentType;
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

export type PayrollEmployeeOnboardingFlowProps = {
  /** UUID of the employment, scoped to the employee token. */
  employmentId: string;
  /** ISO 3166-1 alpha-3 country code of the employment (e.g. 'GBR'). Required for form schema fetching. */
  countryCode: string;
  /** Optional. Pre-populate form fields. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollEmployeeOnboardingRenderProps) => React.ReactNode;
};
