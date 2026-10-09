import type { EmployeeStepKey } from '@/src/flows/PayrollEmployeeOnboarding/hooks';

type StepValues = Record<string, unknown>;

export const getEmployeeStepDefaultValues = (
  step: EmployeeStepKey,
  {
    initialValues,
    savedValues,
    stepValues,
  }: {
    initialValues?: Record<string, unknown>;
    savedValues?: Partial<Record<EmployeeStepKey, StepValues>>;
    stepValues?: Partial<Record<EmployeeStepKey, StepValues>> | null;
  },
): StepValues => ({
  ...(initialValues?.[step] as StepValues | undefined),
  ...savedValues?.[step],
  ...stepValues?.[step],
});
