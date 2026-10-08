import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';
import { getEmployeeStepDefaultValues } from '@/src/flows/PayrollEmployeeOnboarding/utils';

/**
 * Render only when employeeBag.selfOnboardingSubsteps includes
 * 'employee_provides_bank_details'. The step is always present in the step
 * state but the substep presence determines whether it is actually required.
 */
export function BankAccountStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  const handleSubmit = useEmployeeStepSubmitHandler(props);

  const isRequired = employeeBag.selfOnboardingSubsteps.some(
    (s) => s.type === 'employee_provides_bank_details',
  );

  if (!isRequired || employeeBag.isLoadingSavedValues) return null;

  return (
    <PayrollEmployeeForm
      onSubmit={handleSubmit}
      defaultValues={getEmployeeStepDefaultValues('bank_account', {
        initialValues: employeeBag.initialValues,
        savedValues: employeeBag.savedValues,
        stepValues: employeeBag.stepState.values,
      })}
    />
  );
}
