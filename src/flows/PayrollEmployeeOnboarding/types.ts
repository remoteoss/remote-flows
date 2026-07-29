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
 * - `no_jurisdiction`: the employment has no work or home address state on
 *   file, which is required for the state-taxes endpoint.
 * - `schema_unavailable`: the backend doesn't expose the form schema for this
 *   step (e.g. `GET /v1/countries/USA/global_payroll_state_taxes` returns 400
 *   or 404). Common on local/staging backends where a schema isn't seeded yet.
 */
export type TaxStepUnavailableReason =
  | 'unsupported_country'
  | 'pending_enrollment'
  | 'no_jurisdiction'
  | 'schema_unavailable';

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
     * USA state-taxes step for the jurisdiction derived from the employment
     * (`employeeBag.jurisdiction`). Returns null when
     * `employeeBag.taxStepsAvailability.state_taxes.isAvailable` is false.
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
  /**
   * UUID of the employment, scoped to the employee token. Country and (for
   * USA employments) work/home jurisdiction are derived internally from this
   * employment — the consumer doesn't need to supply or look them up.
   */
  employmentId: string;
  /** Optional. Pre-populate form fields. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollEmployeeOnboardingRenderProps) => React.ReactNode;
};
