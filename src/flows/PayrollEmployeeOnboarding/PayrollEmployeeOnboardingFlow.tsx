import { useId } from 'react';
import { usePayrollEmployeeOnboarding } from '@/src/flows/PayrollEmployeeOnboarding/hooks';
import { PayrollEmployeeOnboardingContext } from '@/src/flows/PayrollEmployeeOnboarding/context';
import type { PayrollEmployeeOnboardingFlowProps } from '@/src/flows/PayrollEmployeeOnboarding/types';

// Stable module-level references — prevents consumer subtrees from unmounting on parent re-renders.
// Each will be replaced with a real implementation in PBYR-4045.
const PersonalDetailsStep = () => null;
const HomeAddressStep = () => null;
const BankAccountStep = () => null;
const SubmitButton = () => null;
const BackButton = () => null;

export const PayrollEmployeeOnboardingFlow = ({
  employmentId,
  initialValues,
  options,
  render,
}: PayrollEmployeeOnboardingFlowProps) => {
  const formId = useId();
  const employeeBag = usePayrollEmployeeOnboarding({
    employmentId,
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
