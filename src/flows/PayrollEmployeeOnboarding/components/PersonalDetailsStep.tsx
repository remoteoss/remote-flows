import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function PersonalDetailsStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  return (
    <PayrollEmployeeForm
      onSubmit={useEmployeeStepSubmitHandler(props)}
      defaultValues={
        employeeBag.initialValues?.personal_details as Record<string, unknown>
      }
    />
  );
}
