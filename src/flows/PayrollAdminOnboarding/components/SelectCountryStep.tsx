import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function SelectCountryStep(props: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  return (
    <PayrollAdminForm
      key={adminBag.countryCode ?? 'no-country'}
      onSubmit={handleSubmit}
      defaultValues={
        adminBag.initialValues?.basic_information as Record<string, unknown>
      }
    />
  );
}
