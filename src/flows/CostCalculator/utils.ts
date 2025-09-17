import type {
  CostCalculatorEmploymentParam,
  CostCalculatorEstimateParams,
} from '@/src/client';

import { $TSFixMe } from '@/src/types/remoteFlows';
import { AnyObjectSchema, number, object } from 'yup';
import { CostCalculatorVersion, defaultEstimationOptions } from './hooks';
import type {
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  CurrencyKey,
} from './types';
import { BASE_RATES } from '@/src/flows/CostCalculator/constants';

/**
 * Build the validation schema for the form.
 * @returns
 */
export function buildValidationSchema(
  fields: $TSFixMe[],
  employerBillingCurrency: string,
  includeEstimationTitle?: boolean,
) {
  const fieldsSchema = fields.reduce<Record<string, AnyObjectSchema>>(
    (fieldsSchemaAcc, field) => {
      // Special handling for salary fields
      if (field.name === 'salary' || field.name === 'salary_conversion') {
        fieldsSchemaAcc[field.name] = (field.schema as AnyObjectSchema).when(
          'salary_converted',
          {
            is: (val: string | null) => val === field.name,
            then: (schema) => schema.required('Salary is required'),
            otherwise: (schema) => schema.optional(),
          },
        );
      } else if (field.name === 'management') {
        fieldsSchemaAcc[field.name] = object({
          management_fee: number()
            .transform((value) => {
              return isNaN(value) ? undefined : value;
            })
            .min(0, 'Management fee must be greater than or equal to 0')
            .max(
              employerBillingCurrency
                ? BASE_RATES[employerBillingCurrency as CurrencyKey]
                : BASE_RATES.USD,
              () => {
                const maxValue = employerBillingCurrency
                  ? BASE_RATES[employerBillingCurrency as CurrencyKey]
                  : BASE_RATES.USD;
                const displayValue = maxValue / 100;
                return `Management fee cannot exceed ${displayValue} ${employerBillingCurrency}`;
              },
            ),
        });
      } else if (field.name === 'estimation_title' && includeEstimationTitle) {
        // Make estimation_title required when includeEstimationTitle is true
        fieldsSchemaAcc[field.name] = (
          field.schema as AnyObjectSchema
        ).required('Estimation title is required');
      } else {
        fieldsSchemaAcc[field.name] = field.schema as AnyObjectSchema;
      }
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
): CostCalculatorEmploymentParam {
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

  const managementFee = Number(employments[0].management?.management_fee);

  return {
    employer_currency_slug: employments[0].currency,
    include_benefits: estimationOptions.includeBenefits,
    include_cost_breakdowns: estimationOptions.includeCostBreakdowns,
    include_premium_benefits: estimationOptions.includePremiumBenefits,
    include_management_fee: estimationOptions.includeManagementFee,
    ...(estimationOptions.includeManagementFee &&
      managementFee && {
        global_discount: {
          quoted_amount: managementFee,
          text: '',
        },
      }),
    employments: employments.map((value) =>
      mapValueToEmployment(value, estimationOptions, version),
    ),
  };
}
