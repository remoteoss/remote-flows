import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { handleStepError } from '@/src/lib/utils';

export function useStepSubmitHandler({
  onSubmit,
  onSuccess,
  onError,
}: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();

  return async (values: Record<string, unknown>) => {
    try {
      await onSubmit?.(values);
      const data = await adminBag.onSubmit(values);
      await onSuccess?.(data);
      adminBag.next();
    } catch (error: unknown) {
      onError?.(handleStepError(error));
    }
  };
}
