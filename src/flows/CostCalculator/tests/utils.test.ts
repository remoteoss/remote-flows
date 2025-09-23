import { describe, expect, it } from 'vitest';
import { defaultEstimationOptions } from '../hooks';
import type {
  CostCalculatorEstimationOptions,
  CostCalculatorEstimationSubmitValues,
} from '../types';
import { buildPayload } from '../utils';

describe('buildPayload', () => {
  it('should build a payload with minimal values', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
      salary: 100_000,
    };

    const payload = buildPayload(values);

    expect(payload).toEqual({
      employer_currency_slug: 'USD',
      include_benefits: defaultEstimationOptions.includeBenefits,
      include_cost_breakdowns: defaultEstimationOptions.includeCostBreakdowns,
      include_premium_benefits: defaultEstimationOptions.includePremiumBenefits,
      include_management_fee: defaultEstimationOptions.includeManagementFee,
      employments: [
        {
          region_slug: 'US',
          annual_gross_salary: 100_000,
          employment_term: 'fixed',
          title: defaultEstimationOptions.title,
        },
      ],
    });
  });

  it('should build a payload with minimal values when salary converted is true', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      hiring_budget: 'employee_annual_salary',
      salary_converted: 'salary_conversion',
      salary: 100_000,
    };

    const payload = buildPayload(values);

    expect(payload).toEqual({
      employer_currency_slug: 'USD',
      include_benefits: defaultEstimationOptions.includeBenefits,
      include_cost_breakdowns: defaultEstimationOptions.includeCostBreakdowns,
      include_premium_benefits: defaultEstimationOptions.includePremiumBenefits,
      include_management_fee: defaultEstimationOptions.includeManagementFee,
      employments: [
        {
          region_slug: 'US',
          annual_gross_salary_in_employer_currency: 100_000,
          employment_term: 'fixed',
          title: defaultEstimationOptions.title,
        },
      ],
    });
  });

  it('should build a payload with minimal values when salary converted is true and hiring_budget is my_hiring_budget', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      hiring_budget: 'my_hiring_budget',
      salary_converted: 'salary_conversion',
      salary: 100_000,
    };

    const payload = buildPayload(values);

    expect(payload).toEqual({
      employer_currency_slug: 'USD',
      include_benefits: defaultEstimationOptions.includeBenefits,
      include_cost_breakdowns: defaultEstimationOptions.includeCostBreakdowns,
      include_premium_benefits: defaultEstimationOptions.includePremiumBenefits,
      include_management_fee: defaultEstimationOptions.includeManagementFee,
      employments: [
        {
          region_slug: 'US',
          annual_total_cost_in_employer_currency: 100_000,
          employment_term: 'fixed',
          title: defaultEstimationOptions.title,
        },
      ],
    });
  });

  it('should build a payload with minimal values when hiring_budget is my_hiring_budget ', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary_converted: 'salary',
      hiring_budget: 'my_hiring_budget',
      salary: 100_000,
    };

    const payload = buildPayload(values);

    expect(payload).toEqual({
      employer_currency_slug: 'USD',
      include_benefits: defaultEstimationOptions.includeBenefits,
      include_cost_breakdowns: defaultEstimationOptions.includeCostBreakdowns,
      include_premium_benefits: defaultEstimationOptions.includePremiumBenefits,
      include_management_fee: defaultEstimationOptions.includeManagementFee,
      employments: [
        {
          region_slug: 'US',
          annual_total_cost: 100_000,
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
      hiring_budget: 'employee_annual_salary',
      region: 'CA',
      salary: 100_000,
      salary_converted: 'salary',
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].region_slug).toBe('CA');
  });

  it('should include benefits if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
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
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
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
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
      contract_duration_type: 'fixed',
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].employment_term).toBe('fixed');
  });

  it('should use custom estimation options if provided', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
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

  it('should get the title from the form values', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary_converted: 'salary',
      salary: 100_000,
      estimation_title: 'Custom Title',
      hiring_budget: 'employee_annual_salary',
    };

    const payload = buildPayload(values);

    expect(payload.employments[0].title).toBe('Custom Title');
  });

  it('should not include some of the benefits if none is selected', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
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

  it('should add management_fee if we provided in the estimationOptions', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary: 100_000,
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
      management: {
        management_fee: '59900',
      },
    };

    const customOptions: CostCalculatorEstimationOptions = {
      includeManagementFee: true,
    };

    const payload = buildPayload(values, customOptions);

    expect(payload.global_discount).toEqual({
      quoted_amount: 59900,
      text: '',
    });
  });

  describe('version parameter', () => {
    const values: CostCalculatorEstimationSubmitValues = {
      currency: 'USD',
      country: 'US',
      salary_converted: 'salary',
      hiring_budget: 'employee_annual_salary',
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
    });

    it('should default to "standard" behavior when only values parameter is provided', () => {
      const payload = buildPayload(values);

      expect(payload.employments[0]).toHaveProperty('annual_gross_salary');
      expect(payload.employments[0].annual_gross_salary).toBe(100_000);
    });
  });

  describe('buildPayload with array input', () => {
    it('should build payload with multiple employments from array', () => {
      const values: CostCalculatorEstimationSubmitValues[] = [
        {
          currency: 'USD',
          country: 'US',
          salary_converted: 'salary',
          hiring_budget: 'employee_annual_salary',
          salary: 100_000,
        },
        {
          currency: 'USD', // Note: currency from first item is used
          country: 'UK',
          salary_converted: 'salary',
          hiring_budget: 'employee_annual_salary',
          salary: 80_000,
        },
      ];

      const payload = buildPayload(values);

      expect(payload).toEqual({
        employer_currency_slug: 'USD', // From first item
        include_benefits: defaultEstimationOptions.includeBenefits,
        include_cost_breakdowns: defaultEstimationOptions.includeCostBreakdowns,
        include_premium_benefits:
          defaultEstimationOptions.includePremiumBenefits,
        include_management_fee: defaultEstimationOptions.includeManagementFee,
        employments: [
          {
            region_slug: 'US',
            annual_gross_salary: 100_000,
            employment_term: 'fixed',
            title: defaultEstimationOptions.title,
          },
          {
            region_slug: 'UK',
            annual_gross_salary: 80_000,
            employment_term: 'fixed',
            title: defaultEstimationOptions.title,
          },
        ],
      });
    });

    it('should handle mixed properties in array (region vs country, benefits)', () => {
      const values: CostCalculatorEstimationSubmitValues[] = [
        {
          currency: 'EUR',
          country: 'DE',
          region: 'Berlin',
          salary: 90_000,
          salary_converted: 'salary',
          hiring_budget: 'employee_annual_salary',
          age: 25,
          benefits: {
            'benefit-health': 'premium',
          },
        },
        {
          currency: 'EUR',
          country: 'FR',
          salary: 85_000,
          contract_duration_type: 'indefinite',
          salary_converted: 'salary',
          hiring_budget: 'employee_annual_salary',
        },
      ];

      const payload = buildPayload(values);
      const employments = payload.employments;

      expect(employments).toHaveLength(2);
      expect(employments[0].region_slug).toBe('Berlin');
      expect(employments[0].age).toBe(25);
      expect(employments[0].benefits).toEqual([
        { benefit_group_slug: 'health', benefit_tier_slug: 'premium' },
      ]);
      expect(employments[1].region_slug).toBe('FR');
      expect(employments[1].employment_term).toBe('indefinite');
      expect(employments[1].age).toBeUndefined();
      expect(employments[1].benefits).toBeUndefined();
    });

    it('should apply version parameter to all employments in array', () => {
      const values: CostCalculatorEstimationSubmitValues[] = [
        {
          currency: 'USD',
          country: 'US',
          salary: 100_000,
          salary_converted: 'salary',
          hiring_budget: 'employee_annual_salary',
        },
        {
          currency: 'USD',
          country: 'UK',
          salary: 80_000,
          salary_converted: 'salary',
          hiring_budget: 'employee_annual_salary',
        },
      ];

      const payload = buildPayload(
        values,
        defaultEstimationOptions,
        'marketing',
      );
      const employments = payload.employments;

      expect(employments[0]).not.toHaveProperty('annual_gross_salary');
      expect(employments[1]).not.toHaveProperty('annual_gross_salary');
      expect(employments[0]).toHaveProperty(
        'annual_gross_salary_in_employer_currency',
      );
      expect(employments[1]).toHaveProperty(
        'annual_gross_salary_in_employer_currency',
      );
    });
  });
});
