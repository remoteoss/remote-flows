import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';
import { getEmployeeStepDefaultValues } from '@/src/flows/PayrollEmployeeOnboarding/utils';

export function PersonalDetailsStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  const handleSubmit = useEmployeeStepSubmitHandler(props);

  if (employeeBag.isLoadingSavedValues) {
    return null;
  }

  return (
    <PayrollEmployeeForm
      onSubmit={handleSubmit}
      defaultValues={getEmployeeStepDefaultValues('personal_details', {
        initialValues: employeeBag.initialValues,
        savedValues: employeeBag.savedValues,
        stepValues: employeeBag.stepState.values,
      })}
    />
  );
}
