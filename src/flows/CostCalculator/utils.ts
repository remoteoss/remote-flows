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
            then: (schema) => schema.required('Required field'),
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
        ).required('Required field');
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
  const managementFee = Number(value.management?.management_fee);
  const currencyCode = value.currency_code;

  const base: CostCalculatorEmploymentParam = {
    region_slug: value.region || value.country,
    employment_term: value.contract_duration_type ?? 'fixed',
    title: value.estimation_title || estimationOptions.title,
    age: value.age ?? undefined,
    ...(value.benefits && { benefits: formatBenefits(value.benefits) }),
    ...(estimationOptions.includeManagementFee &&
      managementFee && {
        discount: {
          quoted_amount: estimationOptions.showManagementFee
            ? managementFee
            : BASE_RATES[currencyCode as keyof typeof BASE_RATES] ||
              BASE_RATES.USD,
          text: '',
        },
      }),
  };

  return {
    ...base,
    ...getSalaryFields(value, version),
  };
}

function getSalaryFields(
  value: CostCalculatorEstimationSubmitValues,
  version: CostCalculatorVersion,
): Partial<CostCalculatorEmploymentParam> {
  const isMarketing =
    version === 'marketing' || value.salary_converted === 'salary_conversion';
  const isStandard =
    version === 'standard' && value.salary_converted === 'salary';
  const useHiringBudget = value.hiring_budget === 'my_hiring_budget';

  if (isMarketing) {
    return useHiringBudget
      ? {
          annual_total_cost_in_employer_currency: value.salary,
        }
      : {
          annual_gross_salary_in_employer_currency: value.salary,
        };
  }

  if (isStandard) {
    return useHiringBudget
      ? {
          annual_total_cost: value.salary,
        }
      : {
          annual_gross_salary: value.salary,
        };
  }

  return {};
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
    include_management_fee: estimationOptions.includeManagementFee,
    employments: employments.map((value) =>
      mapValueToEmployment(value, estimationOptions, version),
    ),
  };
}
