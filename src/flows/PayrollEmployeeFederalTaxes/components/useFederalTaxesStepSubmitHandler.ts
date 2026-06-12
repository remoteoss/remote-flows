import { usePayrollEmployeeFederalTaxesContext } from '@/src/flows/PayrollEmployeeFederalTaxes/context';
import type { GPStepCallbacks } from '@/src/flows/types';
import { isMutationError } from '@/src/lib/mutations';

export function useFederalTaxesStepSubmitHandler({
  onSubmit,
  onSuccess,
  onError,
}: GPStepCallbacks) {
  const { flowBag } = usePayrollEmployeeFederalTaxesContext();

  return async (values: Record<string, unknown>) => {
    try {
      await onSubmit?.(values);
      const data = await flowBag.onSubmit(values);
      await onSuccess?.(data);
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
