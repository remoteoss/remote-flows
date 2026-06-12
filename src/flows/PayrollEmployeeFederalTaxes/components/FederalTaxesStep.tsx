import { usePayrollEmployeeFederalTaxesContext } from '@/src/flows/PayrollEmployeeFederalTaxes/context';
import { PayrollEmployeeFederalTaxesForm } from '@/src/flows/PayrollEmployeeFederalTaxes/components/PayrollEmployeeFederalTaxesForm';
import { useFederalTaxesStepSubmitHandler } from '@/src/flows/PayrollEmployeeFederalTaxes/components/useFederalTaxesStepSubmitHandler';
import type { GPStepCallbacks } from '@/src/flows/types';

/**
 * Renders the W-4 federal taxes form. Returns null when the flow is
 * unavailable (non-USA country or employment not yet active). Consumers
 * should check `flowBag.isAvailable` / `flowBag.unavailableReason` to
 * render a friendly not-available state.
 */
export function FederalTaxesStep(props: GPStepCallbacks) {
  const { flowBag } = usePayrollEmployeeFederalTaxesContext();
  const handleSubmit = useFederalTaxesStepSubmitHandler(props);

  if (!flowBag.isAvailable) return null;

  return (
    <PayrollEmployeeFederalTaxesForm
      onSubmit={handleSubmit}
      defaultValues={
        flowBag.initialValues?.federal_taxes as Record<string, unknown>
      }
    />
  );
}
