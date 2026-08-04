import { useId } from 'react';
import { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';
import { PayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import type { PayrollEmployeeOnboardingFlowProps } from '@/src/flows/PayrollEmployeeOnboarding/types';
import { PersonalDetailsStep } from '@/src/flows/PayrollEmployeeOnboarding/components/PersonalDetailsStep';
import { HomeAddressStep } from '@/src/flows/PayrollEmployeeOnboarding/components/HomeAddressStep';
import { BankAccountStep } from '@/src/flows/PayrollEmployeeOnboarding/components/BankAccountStep';
import { FederalTaxesStep } from '@/src/flows/PayrollEmployeeOnboarding/components/FederalTaxesStep';
import { StateTaxesStep } from '@/src/flows/PayrollEmployeeOnboarding/components/StateTaxesStep';
import { SubmitButton } from '@/src/flows/PayrollEmployeeOnboarding/components/SubmitButton';
import { BackButton } from '@/src/flows/PayrollEmployeeOnboarding/components/BackButton';

export const PayrollEmployeeOnboardingFlow = ({
  employmentId,
  countryCode,
  jurisdiction,
  initialValues,
  options,
  render,
}: PayrollEmployeeOnboardingFlowProps) => {
  const formId = useId();
  const employeeBag = usePayrollEmployeeOnboarding({
    employmentId,
    countryCode,
    jurisdiction,
    initialValues,
    options,
  });

  return (
    <PayrollEmployeeOnboardingContext.Provider value={{ formId, employeeBag }}>
      {render({
        employeeBag,
        components: {
          PersonalDetailsStep,
          HomeAddressStep,
          BankAccountStep,
          FederalTaxesStep,
          StateTaxesStep,
          SubmitButton,
          BackButton,
        },
      })}
    </PayrollEmployeeOnboardingContext.Provider>
  );
};
