import { getInitialValues } from '@/src/components/form/utils';
import type { EmployeeStepKey } from '@/src/flows/PayrollEmployeeOnboarding/hooks';
import type { JSFFields } from '@/src/types/remoteFlows';

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

export const toEmployeeFormValues = (
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
