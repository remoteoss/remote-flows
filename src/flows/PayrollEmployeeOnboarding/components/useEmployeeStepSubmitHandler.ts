import { usePayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { isMutationError } from '@/src/lib/mutations';

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
      if (isMutationError(error)) {
        onError?.({
          error: error.error,
          rawError: error.rawError,
          fieldErrors: error.fieldErrors,
        });
      } else {
        onError?.({
          error: error as Error,
          rawError: error as Record<string, unknown>,
          fieldErrors: [],
        });
      }
    }
  };
}
