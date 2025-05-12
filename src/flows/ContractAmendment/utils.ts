import { EmploymentShowResponse } from '@/src/client';
import { convertFromCents } from '@/src/components/form/utils';
// TODO: We have Field in the new version but it's not exported
//import { Fields } from '@remoteoss/json-schema-form';
import { Step } from '../useStepState';
import { $TSFixMe } from '@/src/types/utils';

type StepKeys = 'form' | 'confirmation_form';

export const STEPS: Record<StepKeys, Step> = {
  form: { index: 0, name: 'form' },
  confirmation_form: { index: 1, name: 'confirmation_form' },
} as const;

export function buildInitialValues(
  employment: EmploymentShowResponse | undefined,
  fields?: $TSFixMe | undefined,
) {
  if (!employment) {
    return {};
  }

  if (!fields) {
    return {
      ...employment.data.employment?.contract_details,
      effective_date: '',
      reason_for_change: '',
      job_title: employment.data.employment?.job_title,
      additional_comments: '',
      annual_gross_salary: convertFromCents(
        employment.data.employment?.contract_details
          ?.annual_gross_salary as string,
      ),
    };
  }

  const allFields: $TSFixMe = fields.map((field: $TSFixMe) => field.name);
  const employmentFields = Object.keys(
    employment?.data?.employment?.contract_details || {},
  );
  const initialValues = (allFields as string[]).reduce<Record<string, unknown>>(
    (initialValuesAcc, field) => {
      if (employmentFields.includes(field)) {
        const contractDetails = employment?.data?.employment?.contract_details;
        initialValuesAcc[field] = contractDetails?.[field] ?? null;
      }
      return initialValuesAcc;
    },
    {},
  );

  return {
    ...initialValues,
    effective_date: '',
    reason_for_change: '',
    job_title: employment.data.employment?.job_title,
    additional_comments: '',
    annual_gross_salary: convertFromCents(
      employment.data.employment?.contract_details
        ?.annual_gross_salary as string,
    ),
    additional_comments_toggle: false,
  };
}
