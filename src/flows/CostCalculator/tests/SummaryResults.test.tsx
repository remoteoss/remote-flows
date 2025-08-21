import { render, screen } from '@testing-library/react';
import { SummaryResults } from '../SummaryResults/SummaryResults';
import userEvent from '@testing-library/user-event';
import { CostCalculatorEmployment } from '@/src/client/types.gen';

const mockEstimations: CostCalculatorEmployment[] = [
  {
    country: {
      name: 'United States',
      code: 'US',
      slug: 'us',
      alpha_2_code: 'US',
      features: [],
    },
    country_benefits_details_url:
      'https://remote.com/country-guides/united-states/benefits',
    country_guide_url: 'https://remote.com/country-guides/united-states',
    has_extra_statutory_payment: false,
    minimum_onboarding_time: 14,
    region: {
      name: 'North America',
      slug: 'north-america',
      code: 'NA',
    },
    employer_currency_costs: {
      monthly_total: 1000000, // $10,000
      annual_total: 12000000, // $120,000
      currency: {
        code: 'USD',
        symbol: '$',
        slug: 'usd',
      },
      annual_contributions_total: 960000, // $9,600
      annual_gross_salary: 10000000, // $100,000
      extra_statutory_payments_total: 0,
      monthly_contributions_total: 80000, // $800
      monthly_gross_salary: 833333, // $8,333.33
      monthly_tce: 913333, // $9,133.33
    },
    regional_currency_costs: {
      monthly_total: 1000000,
      annual_total: 12000000,
      currency: {
        code: 'USD',
        symbol: '$',
        slug: 'usd',
      },
      annual_contributions_total: 960000,
      annual_gross_salary: 10000000,
      extra_statutory_payments_total: 0,
      monthly_contributions_total: 80000,
      monthly_gross_salary: 833333,
      monthly_tce: 913333,
    },
  },
  {
    country: {
      name: 'United States',
      code: 'US',
      slug: 'us',
      alpha_2_code: 'US',
      features: [],
    },
    country_benefits_details_url:
      'https://remote.com/country-guides/united-states/benefits',
    country_guide_url: 'https://remote.com/country-guides/united-states',
    has_extra_statutory_payment: false,
    minimum_onboarding_time: 14,
    region: {
      name: 'North America',
      slug: 'north-america',
      code: 'NA',
    },
    employer_currency_costs: {
      monthly_total: 1500000, // $15,000
      annual_total: 18000000, // $180,000
      currency: {
        code: 'USD',
        symbol: '$',
        slug: 'usd',
      },
      annual_contributions_total: 1440000, // $14,400
      annual_gross_salary: 15000000, // $150,000
      extra_statutory_payments_total: 0,
      monthly_contributions_total: 120000, // $1,200
      monthly_gross_salary: 1250000, // $12,500
      monthly_tce: 1370000, // $13,700
    },
    regional_currency_costs: {
      monthly_total: 1500000,
      annual_total: 18000000,
      currency: {
        code: 'USD',
        symbol: '$',
        slug: 'usd',
      },
      annual_contributions_total: 1440000,
      annual_gross_salary: 15000000,
      extra_statutory_payments_total: 0,
      monthly_contributions_total: 120000,
      monthly_gross_salary: 1250000,
      monthly_tce: 1370000,
    },
  },
  {
    country: {
      name: 'Germany',
      code: 'DE',
      slug: 'de',
      alpha_2_code: 'DE',
      features: [],
    },
    country_benefits_details_url:
      'https://remote.com/country-guides/germany/benefits',
    country_guide_url: 'https://remote.com/country-guides/germany',
    has_extra_statutory_payment: false,
    minimum_onboarding_time: 21,
    region: {
      name: 'Europe',
      slug: 'europe',
      code: 'EU',
    },
    employer_currency_costs: {
      monthly_total: 800000, // $8,000
      annual_total: 9600000, // $96,000
      currency: {
        code: 'USD',
        symbol: '$',
        slug: 'usd',
      },
      annual_contributions_total: 768000, // $7,680
      annual_gross_salary: 8000000, // $80,000
      extra_statutory_payments_total: 0,
      monthly_contributions_total: 64000, // $640
      monthly_gross_salary: 666667, // $6,666.67
      monthly_tce: 730667, // $7,306.67
    },
    regional_currency_costs: {
      monthly_total: 800000,
      annual_total: 9600000,
      currency: {
        code: 'USD',
        symbol: '$',
        slug: 'usd',
      },
      annual_contributions_total: 768000,
      annual_gross_salary: 8000000,
      extra_statutory_payments_total: 0,
      monthly_contributions_total: 64000,
      monthly_gross_salary: 666667,
      monthly_tce: 730667,
    },
  },
] as const;

describe('SummaryResults', () => {
  it('renders the summary header with correct currency', () => {
    render(<SummaryResults estimations={mockEstimations} />);

    expect(screen.getByText('Summary Overview')).toBeInTheDocument();
    expect(
      screen.getByText('Employer billing currency: USD'),
    ).toBeInTheDocument();
  });

  it('shows correct total costs for all employees', () => {
    render(<SummaryResults estimations={mockEstimations} />);

    expect(screen.getByText('$33,000.00')).toBeInTheDocument();

    expect(screen.getByText('$396,000.00')).toBeInTheDocument();
  });

  it('groups and sums costs by country correctly', async () => {
    render(<SummaryResults estimations={mockEstimations} />);

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('$25,000.00')).toBeInTheDocument();
    expect(screen.getByText('$300,000.00')).toBeInTheDocument();

    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('$8,000.00')).toBeInTheDocument();
    expect(screen.getByText('$96,000.00')).toBeInTheDocument();
  });

  it('expands and collapses accordion sections', async () => {
    const user = userEvent.setup();
    render(<SummaryResults estimations={mockEstimations} />);

    const costForAllEmployeesText = screen.getByText('Cost for all employees');
    expect(costForAllEmployeesText).toBeInTheDocument();

    // Check that the monthly cost row is visible
    const monthlyCostRow = screen.getByText((_, element) => {
      return element?.textContent === 'Monthly cost$33,000.00';
    });
    expect(monthlyCostRow).toBeInTheDocument();

    // Collapse main section
    await user.click(screen.getByText('Summary Overview'));

    // Content should be hidden
    expect(
      screen.queryByText('Cost for all employees'),
    ).not.toBeInTheDocument();

    // Expand again
    await user.click(screen.getByText('Summary Overview'));

    // Content should be visible again
    expect(screen.getByText('Cost for all employees')).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        return element?.textContent === 'Monthly cost$33,000.00';
      }),
    ).toBeInTheDocument();
  });
});
