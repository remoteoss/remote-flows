import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function AdministrativeDetailsStep(props: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  // Merge (not ||): an empty {} saved after a no-edit advance is truthy and
  // would blank the form; initialValues is the base, saved edits override.
  const defaultValues = {
    ...(adminBag.initialValues?.administrative_details as Record<
      string,
      unknown
    >),
    ...(adminBag.stepState.values?.administrative_details as Record<
      string,
      unknown
    >),
  };

  return (
    <PayrollAdminForm onSubmit={handleSubmit} defaultValues={defaultValues} />
  );
}
