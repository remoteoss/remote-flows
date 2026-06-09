import { useMemo, useCallback } from 'react';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useStepState } from '@/src/flows/useStepState';
import type { Step } from '@/src/flows/useStepState';
import type { PayrollEmployeeOnboardingFlowProps } from '@/src/flows/PayrollEmployeeOnboarding/types';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';

export type EmployeeStepKey =
  | 'personal_details'
  | 'home_address'
  | 'bank_account';

// Steps are stable — visibility of bank_account is not derived from loaded data here.
// Consumers check selfOnboardingSubsteps to determine whether the bank_account step
// applies to the employment; the BankAccountStep component handles its own no-op case.
const EMPLOYEE_STEPS: Record<EmployeeStepKey, Step<EmployeeStepKey>> = {
  personal_details: { index: 0, name: 'personal_details' },
  home_address: { index: 1, name: 'home_address' },
  bank_account: { index: 2, name: 'bank_account' },
};

export const usePayrollEmployeeOnboarding = ({
  employmentId,
  initialValues,
  options,
}: Omit<PayrollEmployeeOnboardingFlowProps, 'render'>) => {
  const { updateErrorContext } = useErrorReporting({ flow: 'payroll_employee_onboarding' });

  const onStepChange = useCallback(
    (step: Step<EmployeeStepKey>) => {
      updateErrorContext({ step: step.name });
    },
    [updateErrorContext],
  );

  const { stepState, nextStep, previousStep, goToStep, setStepValues } =
    useStepState<EmployeeStepKey>(EMPLOYEE_STEPS, onStepChange);

  const { data: apiSteps, isLoading, refetch: refetchSteps } =
    useGPOnboardingSteps(employmentId);

  const selfOnboardingSubsteps = useMemo(() => {
    const selfOnboarding = apiSteps?.find((s) => s.type === 'self_onboarding');
    return selfOnboarding?.sub_steps ?? [];
  }, [apiSteps]);

  const isComplete =
    apiSteps?.find((s) => s.type === 'completion')?.sub_steps?.[0]?.status ===
    'completed';

  return {
    stepState,
    isLoading,
    isComplete: isComplete ?? false,
    employmentId,
    initialValues,
    options,
    apiSteps,
    selfOnboardingSubsteps,
    refetchSteps,
    goToNextStep: nextStep,
    goToPreviousStep: previousStep,
    goToStep,
    setStepValues,
  };
};
