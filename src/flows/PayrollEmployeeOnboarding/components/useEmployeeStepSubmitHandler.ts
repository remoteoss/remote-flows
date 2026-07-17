import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { handleStepError } from '@/src/lib/utils';

export function useEmployeeStepSubmitHandler({
  onSubmit,
  onSuccess,
  onError,
}: GPStepCallbacks) {
  const { employeeBag } = usePayrollEmployeeOnboardingContext();

  return async (values: Record<string, unknown>) => {
    try {
      await onSubmit?.(values);
      const data = await employeeBag.onSubmit(values);
      await onSuccess?.(data);
      employeeBag.next();
    } catch (error: unknown) {
      onError?.(handleStepError(error));
    }
  };
}
