import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function AdministrativeDetailsStep(props: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  const defaultValues =
    (adminBag.stepState.values?.administrative_details as Record<
      string,
      unknown
    >) ||
    (adminBag.initialValues?.administrative_details as Record<string, unknown>);

  return (
    <PayrollAdminForm onSubmit={handleSubmit} defaultValues={defaultValues} />
  );
}
