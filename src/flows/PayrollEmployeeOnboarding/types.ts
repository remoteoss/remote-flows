import { FlowOptions, GPStepCallbacks } from '@/src/flows/types';
import { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';

export type { GPStepCallbacks as GPEmployeeStepCallbacks };

type StepComponentType = React.ComponentType<GPStepCallbacks>;

/**
 * Reasons a tax step (federal or state) is unavailable to the employee right now.
 *
 * - `unsupported_country`: only USA employments expose the tax steps.
 * - `pending_enrollment`: the employment is not yet `active`, so the
 *   corresponding tax_task does not exist on the backend yet (PUT returns 404
 *   with `Tax task not found...`).
 * - `no_jurisdiction`: a `jurisdiction` prop was not supplied to the flow,
 *   which is required for the state-taxes endpoint.
 */
export type TaxStepUnavailableReason =
  | 'unsupported_country'
  | 'pending_enrollment'
  | 'no_jurisdiction';

export type PayrollEmployeeOnboardingRenderProps = {
  employeeBag: ReturnType<typeof usePayrollEmployeeOnboarding>;
  components: {
    PersonalDetailsStep: StepComponentType;
    HomeAddressStep: StepComponentType;
    /** Check employeeBag.selfOnboardingSubsteps for 'employee_provides_bank_details' before rendering. */
    BankAccountStep: StepComponentType;
    /**
     * USA W-4 step. Returns null when `employeeBag.taxStepsAvailability.federal_taxes.isAvailable`
     * is false — read the bag to render your own not-available UI.
     */
    FederalTaxesStep: StepComponentType;
    /**
     * USA state-taxes step for a single jurisdiction (`PayrollEmployeeOnboardingFlowProps.jurisdiction`).
     * Returns null when `employeeBag.taxStepsAvailability.state_taxes.isAvailable` is false.
     */
    StateTaxesStep: StepComponentType;
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
  /**
   * Optional US state code (e.g. 'CA', 'NY'). Required for the state_taxes step
   * to be rendered; omit it for non-USA employments or to skip state taxes entirely.
   */
  jurisdiction?: string;
  /** Optional. Pre-populate form fields. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollEmployeeOnboardingRenderProps) => React.ReactNode;
};
