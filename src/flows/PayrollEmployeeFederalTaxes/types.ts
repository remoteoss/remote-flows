import { FlowOptions, GPStepCallbacks } from '@/src/flows/types';
import { usePayrollEmployeeFederalTaxes } from '@/src/flows/PayrollEmployeeFederalTaxes/hooks';

export type { GPStepCallbacks as PayrollEmployeeFederalTaxesStepCallbacks };

type StepComponentType = React.ComponentType<GPStepCallbacks>;

/**
 * Reason the federal taxes flow cannot be filled in right now.
 *
 * - `unsupported_country`: only USA employments can use this flow.
 * - `pending_enrollment`: the employment is not yet `active`, so the
 *   `federal_taxes` tax_task does not exist on the backend yet
 *   (PUT /v1/employee/federal-taxes returns 404 in this state).
 */
export type FederalTaxesUnavailableReason =
  | 'unsupported_country'
  | 'pending_enrollment';

export type PayrollEmployeeFederalTaxesRenderProps = {
  flowBag: ReturnType<typeof usePayrollEmployeeFederalTaxes>;
  components: {
    /** Renders the W-4 form. Returns null when `flowBag.isAvailable` is false. */
    FederalTaxesStep: StepComponentType;
    SubmitButton: React.ComponentType<
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        children?: React.ReactNode;
      }
    >;
  };
};

export type PayrollEmployeeFederalTaxesFlowProps = {
  /** UUID of the employment, scoped to the employee assertion token. */
  employmentId: string;
  /** ISO 3166-1 alpha-3 country code of the employment. Only 'USA' is supported. */
  countryCode: string;
  /** Optional. Pre-populate form fields under `federal_taxes`. */
  initialValues?: Record<string, unknown>;
  options?: Omit<FlowOptions, 'jsfModify' | 'jsonSchemaVersion'>;
  render: (props: PayrollEmployeeFederalTaxesRenderProps) => React.ReactNode;
};
