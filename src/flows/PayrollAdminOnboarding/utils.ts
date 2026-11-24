import { getInitialValues } from '@/src/components/form/utils';
import type { JSFFields } from '@/src/types/remoteFlows';

type StepValues = Record<string, unknown>;

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
