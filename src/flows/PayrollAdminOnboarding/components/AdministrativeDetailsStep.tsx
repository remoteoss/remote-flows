import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import { getAdminStepDefaultValues } from '@/src/flows/PayrollAdminOnboarding/utils';
import type { GPStepCallbacks } from '@/src/flows/types';

export function AdministrativeDetailsStep(props: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  if (adminBag.isLoadingSavedValues) {
    return null;
  }

  return (
    <PayrollAdminForm
      onSubmit={handleSubmit}
      defaultValues={getAdminStepDefaultValues('administrative_details', {
        initialValues: adminBag.initialValues,
        savedValues: adminBag.savedValues,
        stepValues: adminBag.stepState.values,
      })}
    />
  );
}
