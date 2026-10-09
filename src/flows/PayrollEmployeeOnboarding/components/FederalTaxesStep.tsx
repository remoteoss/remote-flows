import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';
import { getEmployeeStepDefaultValues } from '@/src/flows/PayrollEmployeeOnboarding/utils';

/**
 * Render only when `employeeBag.taxStepsAvailability.federal_taxes.isAvailable`
 * is true. Returns null otherwise so the consumer can render their own
 * not-available UI driven by `unavailableReason`. The step also flips itself
 * to unavailable retroactively if the backend returns 404 on submit.
 */
export function FederalTaxesStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  const handleSubmit = useEmployeeStepSubmitHandler(props);

  if (
    !employeeBag.taxStepsAvailability.federal_taxes.isAvailable ||
    employeeBag.isLoadingSavedValues
  )
    return null;

  return (
    <PayrollEmployeeForm
      onSubmit={handleSubmit}
      defaultValues={getEmployeeStepDefaultValues('federal_taxes', {
        initialValues: employeeBag.initialValues,
        savedValues: employeeBag.savedValues,
        stepValues: employeeBag.stepState.values,
      })}
    />
  );
}
