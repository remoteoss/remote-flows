import { useId } from 'react';
import { usePayrollEmployeeFederalTaxes } from '@/src/flows/PayrollEmployeeFederalTaxes/hooks';
import { PayrollEmployeeFederalTaxesContext } from '@/src/flows/PayrollEmployeeFederalTaxes/context';
import type { PayrollEmployeeFederalTaxesFlowProps } from '@/src/flows/PayrollEmployeeFederalTaxes/types';
import { FederalTaxesStep } from '@/src/flows/PayrollEmployeeFederalTaxes/components/FederalTaxesStep';
import { SubmitButton } from '@/src/flows/PayrollEmployeeFederalTaxes/components/SubmitButton';

export const PayrollEmployeeFederalTaxesFlow = ({
  employmentId,
  countryCode,
  initialValues,
  options,
  render,
}: PayrollEmployeeFederalTaxesFlowProps) => {
  const formId = useId();
  const flowBag = usePayrollEmployeeFederalTaxes({
    employmentId,
    countryCode,
    initialValues,
    options,
  });

  return (
    <PayrollEmployeeFederalTaxesContext.Provider value={{ formId, flowBag }}>
      {render({
        flowBag,
        components: {
          FederalTaxesStep,
          SubmitButton,
        },
      })}
    </PayrollEmployeeFederalTaxesContext.Provider>
  );
};
