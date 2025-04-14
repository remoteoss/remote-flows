import { EmploymentShowResponse } from '@/src/client';
import { convertFromCents } from '@/src/components/form/utils';
import { Fields } from '@remoteoss/json-schema-form';

type Step<T extends string = string> = {
  index: number;
  name: T;
};

export const STEPS: Record<
  string,
  Step<'form' | 'confirmation_form' | 'completed'>
> = {
  AMENDMENT_FORM: { index: 1, name: 'form' },
  CONFIRMATION_FORM: { index: 2, name: 'confirmation_form' },
};

export function buildInitialValues(
  employment: EmploymentShowResponse | undefined,
  fields?: Fields | undefined,
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

  const allFields = fields.map((field) => field.name);
  const employmentFields = Object.keys(
    employment?.data?.employment?.contract_details || {},
  );
  const initialValues = allFields.reduce<Record<string, unknown>>(
    (initialValuesAcc, field) => {
      // @ts-expect-error error
      if (employmentFields.includes(field)) {
        const contractDetails = employment?.data?.employment
          ?.contract_details as Record<string, unknown>;
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
    job_title: employment.data.employment?.job_title,
    additional_comments: '',
    annual_gross_salary: convertFromCents(
      employment.data.employment?.contract_details
        ?.annual_gross_salary as string,
    ),
    additional_comments_toggle: false,
  };
}
