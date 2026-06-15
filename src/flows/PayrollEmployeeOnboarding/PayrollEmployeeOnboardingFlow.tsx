import { useId } from 'react';
import { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';
import { PayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import type { PayrollEmployeeOnboardingFlowProps } from '@/src/flows/PayrollEmployeeOnboarding/types';
import { PersonalDetailsStep } from '@/src/flows/PayrollEmployeeOnboarding/components/PersonalDetailsStep';
import { HomeAddressStep } from '@/src/flows/PayrollEmployeeOnboarding/components/HomeAddressStep';
import { BankAccountStep } from '@/src/flows/PayrollEmployeeOnboarding/components/BankAccountStep';
import { SubmitButton } from '@/src/flows/PayrollEmployeeOnboarding/components/SubmitButton';
import { BackButton } from '@/src/flows/PayrollEmployeeOnboarding/components/BackButton';

export const PayrollEmployeeOnboardingFlow = ({
  employmentId,
  countryCode,
  initialValues,
  options,
  render,
}: PayrollEmployeeOnboardingFlowProps) => {
  const formId = useId();
  const employeeBag = usePayrollEmployeeOnboarding({
    employmentId,
    countryCode,
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
          SubmitButton,
          BackButton,
        },
      })}
    </PayrollEmployeeOnboardingContext.Provider>
  );
};
