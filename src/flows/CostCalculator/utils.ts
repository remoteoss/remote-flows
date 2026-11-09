import type {
  CostCalculatorEmploymentParam,
  CostCalculatorEstimateParams,
} from '@/src/client';

import { number, object, string } from 'yup';
import { toOneOf } from '@/src/common/headlessForm';
import { CostCalculatorVersion, defaultEstimationOptions } from './hooks';
import type {
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
  CurrencyKey,
} from './types';
import { BASE_RATES } from '@/src/flows/CostCalculator/constants';
import { jsonSchema } from '@/src/flows/CostCalculator/jsonSchema';

type SelectOption = { label: string; value: string };

type CostCalculatorSchemaParams = {
  countries?: SelectOption[];
  currencies?: SelectOption[];
  regions: SelectOption[];
  employerBillingCurrency: string;
  includeEstimationTitle?: boolean;
};

function getManagementFeeLimit(employerBillingCurrency: string) {
  const maximum = BASE_RATES[employerBillingCurrency as CurrencyKey];
  if (!maximum) {
    return undefined;
  }
  return {
    maximum,
    message: `Management fee cannot exceed ${maximum / 100} ${employerBillingCurrency}`,
  };
}

/**
 * Build the cost calculator schema with the options and rules that depend on API data.
 */
export function buildCostCalculatorSchema({
  countries,
  currencies,
  regions,
  employerBillingCurrency,
  includeEstimationTitle,
}: CostCalculatorSchemaParams) {
  const baseSchema = jsonSchema.data.schema;
  const { country, region, currency, management, ...otherProperties } =
    baseSchema.properties;
  const hasRegions = regions.length > 0;
  const managementFeeLimit = getManagementFeeLimit(employerBillingCurrency);

  return {
    ...baseSchema,
    properties: {
      country: { ...country, oneOf: toOneOf(countries) },
      ...(hasRegions && { region: { ...region, oneOf: toOneOf(regions) } }),
      currency: { ...currency, oneOf: toOneOf(currencies) },
      ...otherProperties,
      management: {
        ...management,
        properties: {
          ...management.properties,
          management_fee: {
            ...management.properties.management_fee,
            ...(managementFeeLimit && {
              maximum: managementFeeLimit.maximum,
              'x-jsf-errorMessage': {
                ...management.properties.management_fee['x-jsf-errorMessage'],
                maximum: managementFeeLimit.message,
              },
            }),
          },
        },
      },
    },
    required: [
      ...baseSchema.required,
      ...(hasRegions ? ['region'] : []),
      ...(includeEstimationTitle ? ['estimation_title'] : []),
    ],
    'x-jsf-order': baseSchema['x-jsf-order'].filter(
      (name) => hasRegions || name !== 'region',
    ),
  };
}

const salaryValidationSchema = (fieldName: 'salary' | 'salary_conversion') =>
  number()
    .typeError('The value must be a number')
    .when('salary_converted', {
      is: fieldName,
      then: (schema) => schema.required('Required field'),
      otherwise: (schema) => schema.nullable().optional(),
    });

/**
 * Build the Yup schema behind the deprecated `validationSchema` of the cost calculator bag.
 */
export function buildValidationSchema({
  regions,
  employerBillingCurrency,
  includeEstimationTitle,
}: Omit<CostCalculatorSchemaParams, 'countries' | 'currencies'>) {
  const managementFeeLimit = getManagementFeeLimit(employerBillingCurrency);
  const managementFee = number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'Management fee must be greater than or equal to 0');

  return object({
    country: string().required('Required field'),
    region:
      regions.length > 0 ? string().required('Region is required') : string(),
    currency: string().required('Required field'),
    hiring_budget: string().oneOf(
      jsonSchema.data.schema.properties.hiring_budget.enum,
      ({ value }) => `The option "${value}" is not valid.`,
    ),
    salary: salaryValidationSchema('salary'),
    salary_conversion: salaryValidationSchema('salary_conversion'),
    salary_converted: string().required('Required field'),
    estimation_title: includeEstimationTitle
      ? string().required('Required field')
      : string(),
    management: object({
      management_fee: managementFeeLimit
        ? managementFee.max(
            managementFeeLimit.maximum,
            managementFeeLimit.message,
          )
        : managementFee,
    }),
  });
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
    const useEmployerCurrency = value.salary_converted === 'salary_conversion';
    return useHiringBudget
      ? {
          annual_total_cost_in_employer_currency: value.salary,
        }
      : {
          [useEmployerCurrency
            ? 'annual_gross_salary_in_employer_currency'
            : 'annual_gross_salary']: value.salary,
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
