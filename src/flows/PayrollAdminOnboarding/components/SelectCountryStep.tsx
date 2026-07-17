import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function SelectCountryStep(props: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  const defaultValues =
    (adminBag.stepState.values?.select_country as Record<string, unknown>) ||
    (adminBag.initialValues?.basic_information as Record<string, unknown>);

  return (
    // Remount the form when the country changes so it re-initializes against
    // the newly loaded basic-information schema instead of the country picker.
    <PayrollAdminForm
      key={adminBag.countryCode ?? 'no-country'}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
    />
  );
}
