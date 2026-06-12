import type { usePayrollEmployeeFederalTaxes } from '@/src/flows/PayrollEmployeeFederalTaxes/hooks';
import { createContext, useContext } from 'react';

export const PayrollEmployeeFederalTaxesContext = createContext<{
  formId: string | undefined;
  flowBag: ReturnType<typeof usePayrollEmployeeFederalTaxes> | null;
}>({
  formId: undefined,
  flowBag: null,
});

export const usePayrollEmployeeFederalTaxesContext = () => {
  const context = useContext(PayrollEmployeeFederalTaxesContext);
  if (!context.formId || !context.flowBag) {
    throw new Error(
      'usePayrollEmployeeFederalTaxesContext must be used within a PayrollEmployeeFederalTaxesFlow',
    );
  }
  return context as {
    formId: string;
    flowBag: ReturnType<typeof usePayrollEmployeeFederalTaxes>;
  };
};
