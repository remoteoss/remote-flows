import type { CostCalculatorEstimateParams } from '@/src/client';

import { $TSFixMe } from '@/src/types/remoteFlows';
import { AnyObjectSchema, object } from 'yup';
import { CostCalculatorVersion, defaultEstimationOptions } from './hooks';
import type {
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
} from './types';

/**
 * Build the validation schema for the form.
 * @returns
 */
export function buildValidationSchema(fields: $TSFixMe[]) {
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
    const benefitTierSlug = benefits[key];
    if (benefitTierSlug === 'none') {
      return acc;
    }
    const benefitGroupSlug = key.replace(needle, '');
    const benefitEntry = {
      benefit_group_slug: benefitGroupSlug,
      benefit_tier_slug: benefitTierSlug,
    };
    return [...acc, benefitEntry];
  }, []);
}

function mapValueToEmployment(
  value: CostCalculatorEstimationSubmitValues,
  estimationOptions: CostCalculatorEstimationOptions,
  version: CostCalculatorVersion,
) {
  return {
    region_slug: value.region || value.country,
    employment_term: value.contract_duration_type ?? 'fixed',
    title: estimationOptions.title,
    age: value.age ?? undefined,
    ...(value.benefits && { benefits: formatBenefits(value.benefits) }),
    ...((version == 'marketing' ||
      value.salary_converted === 'salary_conversion') && {
      annual_gross_salary_in_employer_currency: value.salary,
    }),
    ...(version === 'standard' &&
      value.salary_converted === 'salary' && {
        annual_gross_salary: value.salary,
      }),
  };
}

/**
 * Build the payload for the cost calculator estimation.
 * @param values
 * @param estimationOptions
 * @returns
 */
export function buildPayload(
  values:
    | CostCalculatorEstimationSubmitValues
    | CostCalculatorEstimationSubmitValues[],
  estimationOptions: CostCalculatorEstimationOptions = defaultEstimationOptions,
  version: CostCalculatorVersion = 'standard',
): CostCalculatorEstimateParams {
  const employments = Array.isArray(values) ? values : [values];

  if (employments.length === 0) {
    throw new Error('At least one employment value is required');
  }

  if (employments.length > 1) {
    const currencies = new Set(employments.map((v) => v.currency));
    if (currencies.size > 1) {
      console.warn(
        'Multiple currencies detected in array. Using currency from first employment.',
      );
    }
  }

  return {
    employer_currency_slug: employments[0].currency,
    include_benefits: estimationOptions.includeBenefits,
    include_cost_breakdowns: estimationOptions.includeCostBreakdowns,
    include_premium_benefits: estimationOptions.includePremiumBenefits,
    employments: employments.map((value) =>
      mapValueToEmployment(value, estimationOptions, version),
    ),
  };
}
