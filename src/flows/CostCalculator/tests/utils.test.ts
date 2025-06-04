import { describe, expect, it } from 'vitest';
import { defaultEstimationOptions } from '../hooks';
import type { CostCalculatorEstimationSubmitValues } from '../types';
import { buildPayload } from '../utils';

describe('buildPayload', () => {
  it('should build a payload with minimal values', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100000,
    };

    const payload = buildPayload(values);

    expect(payload).toEqual({
      employer_currency_slug: 'USD',
      include_benefits: defaultEstimationOptions.includeBenefits,
      include_cost_breakdowns: defaultEstimationOptions.includeCostBreakdowns,
      include_premium_benefits: defaultEstimationOptions.includePremiumBenefits,
      employments: [
        {
          region_slug: 'US',
          annual_gross_salary: 100_000,
          annual_gross_salary_in_employer_currency: 100_000,
          employment_term: 'fixed',
          title: defaultEstimationOptions.title,
          regional_to_employer_exchange_rate: '1',
        },
      ],
    });
  });

  it('should use region if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      region: 'CA',
      salary: 100000,
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].region_slug).toBe('CA');
  });

  it('should include benefits if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100000,
      benefits: {
        'benefit-health': 'premium',
        'benefit-dental': 'basic',
      },
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].benefits).toEqual([
      { benefit_group_slug: 'health', benefit_tier_slug: 'premium' },
      { benefit_group_slug: 'dental', benefit_tier_slug: 'basic' },
    ]);
  });

  it('should include age if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100000,
      age: 30,
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].age).toBe(30);
  });

  it('should use contract_duration_type if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100000,
      contract_duration_type: 'fixed',
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].employment_term).toBe('fixed');
  });

  it('should use custom estimation options if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100000,
    };

    const customOptions = {
      includeBenefits: false,
      includeCostBreakdowns: false,
      title: 'Custom Title',
    };

    const payload = buildPayload(values, customOptions);

    expect(payload.include_benefits).toBe(false);
    expect(payload.include_cost_breakdowns).toBe(false);
    expect(payload.employments[0].title).toBe('Custom Title');
  });
});
