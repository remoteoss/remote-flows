import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { isMutationError } from '@/src/lib/mutations';

/**
 * Shared submit handler for form-based GP admin steps.
 * Calls adminBag.onSubmit, routes errors through isMutationError, then advances step.
 */
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
