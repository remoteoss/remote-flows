import { AnyObjectSchema, object } from 'yup';

import type { CostCalculatorEstimateParams } from '@/src/client';
import { convertToCents } from '@/src/lib/utils';
import { defaultEstimationOptions } from './hooks';
import type {
  CostCalculatorEstimationFormValues,
  CostCalculatorEstimationOptions,
  Field,
} from './types';

/**
 * Build the validation schema for the form.
 * @returns
 */
export function buildValidationSchema(fields: Field[]) {
  const fieldsSchema = fields.reduce<Record<string, AnyObjectSchema>>(
    (fieldsSchemaAcc, field) => {
      fieldsSchemaAcc[field.name] = field.schema as AnyObjectSchema;
      return fieldsSchemaAcc;
    },
    {},
  );
  return object(fieldsSchema) as AnyObjectSchema;
}

/**
 * Format the benefits to the expected format by the API.
 * @param benefits
 * @returns
 */
function formatBenefits(benefits: Record<string, string>) {
  const needle = 'benefit-';
  return Object.keys(benefits).reduce<
    Array<{ benefit_group_slug: string; benefit_tier_slug: string }>
  >((acc, key) => {
    const benefitGroupSlug = key.replace(needle, '');
    const benefitEntry = {
      benefit_group_slug: benefitGroupSlug,
      benefit_tier_slug: benefits[key],
    };
    return [...acc, benefitEntry];
  }, []);
}

/**
 * Build the payload for the cost calculator estimation.
 * @param values
 * @param estimationOptions
 * @returns
 */
export function buildPayload(
  values: CostCalculatorEstimationFormValues,
  estimationOptions: CostCalculatorEstimationOptions = defaultEstimationOptions,
): CostCalculatorEstimateParams {
  return {
    employer_currency_slug: values.currency,
    include_benefits: estimationOptions.includeBenefits,
    include_cost_breakdowns: estimationOptions.includeCostBreakdowns,
    employments: [
      {
        region_slug: values.region || values.country,
        annual_gross_salary: convertToCents(values.salary),
        annual_gross_salary_in_employer_currency: convertToCents(values.salary),
        employment_term: values.contract_duration_type ?? 'fixed',
        title: estimationOptions.title,
        regional_to_employer_exchange_rate: '1',
        age: values.age ?? undefined,
        ...(values.benefits && { benefits: formatBenefits(values.benefits) }),
      },
    ],
  };
}
