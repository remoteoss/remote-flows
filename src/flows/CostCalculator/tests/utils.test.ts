import { describe, expect, it } from 'vitest';
import { defaultEstimationOptions } from '../hooks';
import type { CostCalculatorEstimationSubmitValues } from '../types';
import { buildPayload } from '../utils';

describe('buildPayload', () => {
  it('should build a payload with minimal values', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
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
        },
      ],
    });
  });

  it('should use region if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      region: 'CA',
      salary: 100_000,
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].region_slug).toBe('CA');
  });

  it('should include benefits if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
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
      salary: 100_000,
      age: 30,
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].age).toBe(30);
  });

  it('should use contract_duration_type if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
      contract_duration_type: 'fixed',
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].employment_term).toBe('fixed');
  });

  it('should use custom estimation options if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
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

  it('should not include some of the benefits if none is selected', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
      benefits: {
        'benefit-health': 'whatever',
        'benefit-dental': 'none',
      },
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].benefits).toEqual([
      {
        benefit_group_slug: 'health',
        benefit_tier_slug: 'whatever',
      },
    ]);
  });

  describe('version parameter', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
    };

    it('should include annual_gross_salary when version is "standard"', () => {
      const payload = buildPayload(
        values,
        defaultEstimationOptions,
        'standard',
      );

      expect(payload.employments[0]).toHaveProperty('annual_gross_salary');
      expect(payload.employments[0].annual_gross_salary).toBe(100_000);
      expect(payload.employments[0]).toHaveProperty(
        'annual_gross_salary_in_employer_currency',
      );
      expect(
        payload.employments[0].annual_gross_salary_in_employer_currency,
      ).toBe(100_000);
    });

    it('should NOT include annual_gross_salary when version is "marketing"', () => {
      const payload = buildPayload(
        values,
        defaultEstimationOptions,
        'marketing',
      );

      expect(payload.employments[0]).not.toHaveProperty('annual_gross_salary');
      expect(payload.employments[0]).toHaveProperty(
        'annual_gross_salary_in_employer_currency',
      );
      expect(
        payload.employments[0].annual_gross_salary_in_employer_currency,
      ).toBe(100_000);
    });

    it('should default to "standard" behavior when version is not provided', () => {
      const payload = buildPayload(values, defaultEstimationOptions);

      expect(payload.employments[0]).toHaveProperty('annual_gross_salary');
      expect(payload.employments[0].annual_gross_salary).toBe(100_000);
      expect(payload.employments[0]).toHaveProperty(
        'annual_gross_salary_in_employer_currency',
      );
      expect(
        payload.employments[0].annual_gross_salary_in_employer_currency,
      ).toBe(100_000);
    });

    it('should default to "standard" behavior when only values parameter is provided', () => {
      const payload = buildPayload(values);

      expect(payload.employments[0]).toHaveProperty('annual_gross_salary');
      expect(payload.employments[0].annual_gross_salary).toBe(100_000);
    });
  });
});
