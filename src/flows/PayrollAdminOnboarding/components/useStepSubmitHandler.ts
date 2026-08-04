import type { UseFormReturn } from 'react-hook-form';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { handleStepError } from '@/src/lib/utils';
import type { $TSFixMe } from '@/src/types/remoteFlows';

export function useStepSubmitHandler({
  onSubmit,
  onSuccess,
  onError,
}: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();

  return async (
    values: Record<string, unknown>,
    form: UseFormReturn<$TSFixMe>,
  ) => {
    try {
      await onSubmit?.(values);
      const data = await adminBag.onSubmit(values);
      await onSuccess?.(data);
      adminBag.next();
    } catch (error: unknown) {
      // Pass the form so server-side field errors are mapped back onto the
      // matching form fields, not only surfaced through the onError callback.
      onError?.(handleStepError(error, undefined, form));
    }
  };
}
