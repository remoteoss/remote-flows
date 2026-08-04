import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import { useStepSubmitHandler } from '@/src/flows/PayrollAdminOnboarding/components/useStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

export function SelectCountryStep(props: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const handleSubmit = useStepSubmitHandler(props);

  // Merge (not ||): stepState.values can be an empty {} after advancing without
  // edits, which is truthy and would blank the form — so initialValues is the
  // base and saved edits override it.
  const defaultValues = {
    ...(adminBag.initialValues?.basic_information as Record<string, unknown>),
    ...(adminBag.stepState.values?.select_country as Record<string, unknown>),
  };

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
