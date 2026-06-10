import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import { PayrollEmployeeForm } from '@/src/flows/PayrollEmployeeOnboarding/components/PayrollEmployeeForm';
import { useEmployeeStepSubmitHandler } from '@/src/flows/PayrollEmployeeOnboarding/components/useEmployeeStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function HomeAddressStep(props: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();
  return (
    <PayrollEmployeeForm
      onSubmit={useEmployeeStepSubmitHandler(props)}
      defaultValues={
        employeeBag.initialValues?.home_address as Record<string, unknown>
      }
    />
  );
}
