import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import type { GPAdminStepCallbacks } from '@/src/flows/PayrollAdminOnboarding/types';

export function ContractDetailsStep(props: GPAdminStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  return (
    <PayrollAdminForm
      onSubmit={handleSubmit}
      defaultValues={
        adminBag.initialValues?.contract_details as Record<string, unknown>
      }
    />
  );
}
