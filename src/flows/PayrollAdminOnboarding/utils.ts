import { getInitialValues } from '@/src/components/form/utils';
import type { AdminStepKey } from '@/src/flows/PayrollAdminOnboarding/hooks';
import type { JSFFields } from '@/src/types/remoteFlows';

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

export const toAdminFormValues = (
  apiValues: StepValues | undefined,
  fields: JSFFields | undefined,
): StepValues | undefined => {
  if (!apiValues || !fields) {
    return undefined;
  }
  const formValues = getInitialValues(fields, apiValues);
  return Object.fromEntries(
    Object.keys(apiValues)
      .filter((key) => key in formValues)
      .map((key) => [key, formValues[key]]),
  );
};
