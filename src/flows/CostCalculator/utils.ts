import type {
  CostCalculatorEmploymentParam,
  CostCalculatorEstimateParams,
} from '@/src/client';

import { FieldValues } from 'react-hook-form';
import { CostCalculatorVersion, defaultEstimationOptions } from './hooks';
import type {
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
} from './types';
import { BASE_RATES } from '@/src/flows/CostCalculator/constants';

/**
 * Decides which of `salary`/`salary_conversion` needs correcting after a currency-swap
 * change, so the value the user already typed carries over to whichever field is now the
 * "main" one instead of appearing to vanish. Pure — returns the patch to apply (or `null` if
 * nothing needs to change) rather than calling `setValue` itself.
 * @param values - Current form values.
 * @param shouldSwapOrder - Whether the employer/employee currencies differ, so the
 * conversion field is currently the one collecting live input.
 * @param fieldName - The field's own name (`salary`, unless the schema is customized).
 * @param defaultValue - Fallback used when neither field has a value yet.
 */
export function syncSalaryConversion(
  values: FieldValues,
  shouldSwapOrder: boolean,
  fieldName: string,
  defaultValue?: string,
): Record<string, string> | null {
  if (shouldSwapOrder) {
    const currentValue = values[fieldName];
    if (currentValue) {
      return {
        salary_conversion: currentValue,
        salary_converted: 'salary_conversion',
      };
    }
    if (defaultValue) {
      return {
        salary_conversion: defaultValue,
        salary_converted: 'salary_conversion',
      };
    }
    return null;
  }

  const conversionValue = values.salary_conversion;
  if (conversionValue) {
    return { [fieldName]: conversionValue, salary_converted: fieldName };
  }
  if (defaultValue) {
    return { [fieldName]: defaultValue, salary_converted: fieldName };
  }
  return null;
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
