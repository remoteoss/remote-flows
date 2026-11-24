import type { AdminStepKey } from '@/src/flows/PayrollAdminOnboarding/hooks';

type StepValues = Record<string, unknown>;

export const getAdminStepDefaultValues = (
  step: AdminStepKey,
  {
    initialValues,
    savedValues,
    stepValues,
  }: {
    initialValues?: Record<string, unknown>;
    savedValues?: Partial<Record<AdminStepKey, StepValues>>;
    stepValues?: Partial<Record<AdminStepKey, StepValues>> | null;
  },
): StepValues => ({
  ...(initialValues?.[step] as StepValues | undefined),
  ...savedValues?.[step],
  ...stepValues?.[step],
});
