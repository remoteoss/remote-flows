import { Employment } from '@/src/client';
import { convertFromCents } from '@/src/components/form/utils';
import { Fields } from '@remoteoss/json-schema-form';
import { Step } from '../useStepState';

type StepKeys = 'form' | 'confirmation_form';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  form: { index: 0, name: 'form' },
  confirmation_form: { index: 1, name: 'confirmation_form' },
} as const;

export function buildInitialValues(
  employment: Employment | undefined,
  fields?: Fields | undefined,
) {
  if (!employment) {
    return {};
  }

  if (!fields) {
    return {
      ...employment.contract_details,
      effective_date: '',
      reason_for_change: '',
      job_title: employment.job_title,
      additional_comments: '',
      annual_gross_salary: convertFromCents(
        employment.contract_details?.annual_gross_salary as string,
      ),
    };
  }

  const allFields = fields.map((field) => field.name);
  const employmentFields = Object.keys(employment?.contract_details || {});
  const initialValues = allFields.reduce<Record<string, unknown>>(
    (initialValuesAcc, field) => {
      // @ts-expect-error error
      if (employmentFields.includes(field)) {
        const contractDetails = employment?.contract_details;
        // @ts-expect-error error
        initialValuesAcc[field] = contractDetails[field];
      }
      return initialValuesAcc;
    },
    {} as Record<string, unknown>,
  );

  return {
    ...initialValues,
    effective_date: '',
    reason_for_change: '',
    job_title: employment.job_title,
    additional_comments: '',
    annual_gross_salary: convertFromCents(
      employment.contract_details?.annual_gross_salary as string,
    ),
    additional_comments_toggle: false,
  };
}
