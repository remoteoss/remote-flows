import type { UseFormReturn } from 'react-hook-form';
import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { handleStepError } from '@/src/lib/utils';
import type { $TSFixMe } from '@/src/types/remoteFlows';
import { TaxPendingEnrollmentError } from '@/src/flows/PayrollEmployeeOnboarding/taxErrors';

export function useEmployeeStepSubmitHandler({
  onSubmit,
  onSuccess,
  onError,
}: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();

  return async (
    values: Record<string, unknown>,
    form: UseFormReturn<$TSFixMe>,
  ) => {
    try {
      await onSubmit?.(values);
      const data = await employeeBag.onSubmit(values);
      await onSuccess?.(data);
      employeeBag.next();
    } catch (error: unknown) {
      // A pending-enrollment tax 404 is already reflected through
      // taxStepsAvailability — don't advance and don't surface it as an error.
      if (error instanceof TaxPendingEnrollmentError) return;
      // Pass the form so server-side field errors are mapped back onto the
      // matching form fields, not only surfaced through the onError callback.
      onError?.(handleStepError(error, undefined, form));
    }
  };
}
