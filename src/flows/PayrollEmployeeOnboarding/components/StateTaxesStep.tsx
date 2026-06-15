import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

/**
 * Render only when `employeeBag.taxStepsAvailability.state_taxes.isAvailable`
 * is true (USA + jurisdiction set + post-enrollment). Returns null otherwise.
 * Submits to PUT /v1/employee/state-taxes/{jurisdiction} where jurisdiction
 * comes from the flow's `jurisdiction` prop.
 */
export function StateTaxesStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  const handleSubmit = useEmployeeStepSubmitHandler(props);

  if (!employeeBag.taxStepsAvailability.state_taxes.isAvailable) return null;

  return (
    <PayrollEmployeeForm
      onSubmit={handleSubmit}
      defaultValues={
        employeeBag.initialValues?.state_taxes as Record<string, unknown>
      }
    />
  );
}
