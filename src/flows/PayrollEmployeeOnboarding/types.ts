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
 * - `no_jurisdiction`: no `jurisdiction` was resolved — either not supplied
 *   as a prop, or not derivable from the employment's work/home address —
 *   and it's required for the state-taxes endpoint.
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
     * USA state-taxes step for a single jurisdiction (`employeeBag.jurisdiction`,
     * either the `jurisdiction` prop or derived from the employment). Returns
     * null when `employeeBag.taxStepsAvailability.state_taxes.isAvailable` is false.
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
  /**
   * ISO 3166-1 alpha-3 country code of the employment (e.g. 'USA'). Optional
   * — when omitted, the flow derives it by calling `GET /v1/employments/:id`
   * itself. Only supply this if your `auth` resolves to a direct
   * employee-scoped token for the whole client (no per-request/per-path
   * token routing): that token can't call `/v1/employments/:id` (401), so
   * there'd be nothing to derive from.
   */
  countryCode?: string;
  /**
   * Optional US state code (e.g. 'CA', 'NY'), required for the state_taxes
   * step to be rendered. When `countryCode` is also omitted, this is derived
   * from the employment's work/home address. See `countryCode` above for
   * when to supply it explicitly.
   */
  jurisdiction?: string;
  /** Optional. Pre-populate form fields. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollEmployeeOnboardingRenderProps) => React.ReactNode;
};
