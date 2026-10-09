import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';
import { getEmployeeStepDefaultValues } from '@/src/flows/PayrollEmployeeOnboarding/utils';

/**
 * Render only when `employeeBag.taxStepsAvailability.state_taxes.isAvailable`
 * is true (USA + jurisdiction set + post-enrollment). Returns null otherwise.
 * Submits to PUT /v1/employee/state-taxes/{jurisdiction} where jurisdiction
 * is derived from the employment (`employeeBag.jurisdiction`).
 */
export function StateTaxesStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  const handleSubmit = useEmployeeStepSubmitHandler(props);

  if (
    !employeeBag.taxStepsAvailability.state_taxes.isAvailable ||
    employeeBag.isLoadingSavedValues
  )
    return null;

  return (
    <PayrollEmployeeForm
      onSubmit={handleSubmit}
      defaultValues={getEmployeeStepDefaultValues('state_taxes', {
        initialValues: employeeBag.initialValues,
        savedValues: employeeBag.savedValues,
        stepValues: employeeBag.stepState.values,
      })}
    />
  );
}
