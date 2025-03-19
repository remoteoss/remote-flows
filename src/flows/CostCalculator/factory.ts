import {
  CostCalculatorFormValues,
  EstimationParams,
} from '@/src/flows/CostCalculator/types';
import { convertToCents } from '@/src/lib/utils';

export const buildCostCalculatorFormPayload = (
  values: CostCalculatorFormValues,
  estimationParams: EstimationParams,
) => {
  return {
    employer_currency_slug: values.currency,
    include_benefits: estimationParams.includeBenefits,
    include_cost_breakdowns: estimationParams.includeCostBreakdowns,
    employments: [
      {
        region_slug: values.region || values.country,
        annual_gross_salary: convertToCents(values.salary),
        annual_gross_salary_in_employer_currency: convertToCents(values.salary),
        employment_term: values.contract_duration_type ?? 'fixed',
        title: estimationParams.title,
        regional_to_employer_exchange_rate: '1',
        age: values.age ?? undefined,
      },
    ],
  };
};
