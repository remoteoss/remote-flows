import { render, screen, fireEvent } from '@testing-library/react';
import { EstimationResults } from '../EstimationResults/EstimationResults';
import { formatCurrency } from '@/src/lib/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { TestProviders } from '@/src/tests/testHelpers';

// $TSFixMe as there are some missing fields in the type CostCalculatorEmployment
const mockEstimation: $TSFixMe = {
  country: {
    code: 'DEU',
    name: 'Germany',
    slug: 'germany-2539b093-1df7-4063-a656-5bcf30603ba6',
    alpha_2_code: 'DE',
  },
  region: {
    code: 'DEU',
    name: 'Germany',
    status: 'active',
    country: {
      code: 'DEU',
      name: 'Germany',
      currency: {
        code: 'EUR',
        name: 'European Euro',
        symbol: '€',
        slug: 'a9635cae-5c4b-438b-b34f-bfb80946036e',
      },
      slug: 'germany-2539b093-1df7-4063-a656-5bcf30603ba6',
      alpha_2_code: 'DE',
    },
    slug: 'a41f478e-cc33-4de8-a044-998368a44790',
    child_regions: [],
    parent_region: null,
  },
  country_benefits_details_url: 'https://remote.com/benefits-guide/germany',
  country_guide_url: 'https://remote.com/country-hiring-considerations#germany',
  employer_currency_costs: {
    currency: {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
      slug: '1b2c181d-24c9-44ff-a8e1-2a7025ca491c',
    },
    monthly_gross_salary: 416667,
    monthly_total: 625765,
    annual_gross_salary: 5000000,
    annual_total: 7509176,
    monthly_benefits_total: 60573,
    annual_benefits_total: 726876,
    monthly_contributions_total: 89125,
    annual_contributions_total: 1069500,
    monthly_management_fee: 59400,
    annual_management_fee: 712800,
    monthly_benefits_breakdown: [
      {
        name: 'Family - Allianz Premium (Family)',
        description: 'Covers medical care...',
        amount: 50363,
      },
    ],
    annual_benefits_breakdown: [
      {
        name: 'Family - Allianz Premium (Family)',
        description: 'Covers medical care...',
        amount: 604356,
      },
    ],
    monthly_contributions_breakdown: [
      {
        name: 'Pension Insurance',
        description: 'Calculated at 9.30%...',
        amount: 38750,
      },
    ],
    annual_contributions_breakdown: [
      {
        name: 'Pension Insurance',
        description: 'Calculated at 9.30%...',
        amount: 465000,
      },
    ],
    extra_statutory_payments_breakdown: [],
    extra_statutory_payments_total: 0,
  },
  regional_currency_costs: {
    currency: {
      code: 'EUR',
      name: 'European Euro',
      symbol: '€',
      slug: 'a9635cae-5c4b-438b-b34f-bfb80946036e',
    },
    monthly_gross_salary: 341604,
    monthly_total: 513032,
    annual_gross_salary: 4099251,
    annual_total: 6156387,
    monthly_benefits_total: 49660,
    annual_benefits_total: 595920,
    monthly_contributions_total: 73069,
    annual_contributions_total: 876828,
    monthly_management_fee: 48699,
    annual_management_fee: 584388,
    monthly_benefits_breakdown: [
      {
        name: 'Family - Allianz Premium (Family)',
        description: 'Covers medical care...',
        amount: 41290,
      },
    ],
    annual_benefits_breakdown: [
      {
        name: 'Family - Allianz Premium (Family)',
        description: 'Covers medical care...',
        amount: 495480,
      },
    ],
    monthly_contributions_breakdown: [
      {
        name: 'Pension Insurance',
        description: 'Calculated at 9.30%...',
        amount: 31769,
      },
    ],
    annual_contributions_breakdown: [
      {
        name: 'Pension Insurance',
        description: 'Calculated at 9.30%...',
        amount: 381228,
      },
    ],
    extra_statutory_payments_breakdown: [],
    extra_statutory_payments_total: 0,
  },
  minimum_onboarding_time: 5,
  has_extra_statutory_payment: false,
};

const defaultProps = {
  estimation: mockEstimation,
  title: 'Test Estimation',
  onDelete: vi.fn(),
  onExportPdf: vi.fn(),
  onEdit: vi.fn(),
};

describe('EstimationResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with basic information', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    // Check if title is rendered
    expect(screen.getByText('Test Estimation')).toBeInTheDocument();

    // Check if country name is rendered
    expect(screen.getByText('Germany')).toBeInTheDocument();

    // Check if annual gross salary is rendered
    const formattedSalary = formatCurrency(
      mockEstimation.regional_currency_costs.annual_gross_salary,
      mockEstimation.regional_currency_costs.currency.symbol,
    );

    const salaryContainer = screen.getByTestId(
      'estimation-results-header-annual-gross-salary',
    );

    // Check for the label text
    expect(salaryContainer).toHaveTextContent('Employee annual gross salary:');
    // Check for the salary value
    expect(salaryContainer).toHaveTextContent(formattedSalary);
  });

  it('handles actions correctly', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    // Open actions dropdown
    const actionsButton = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(actionsButton);

    // Click edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalled();

    fireEvent.click(actionsButton);

    // Click export button
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    expect(defaultProps.onExportPdf).toHaveBeenCalled();

    fireEvent.click(actionsButton);

    // Click delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('displays correct currency amounts for multiple currencies', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    // Check if both currency columns are displayed
    expect(screen.getByText('Employee currency')).toBeInTheDocument();
    expect(screen.getByText('Employer currency')).toBeInTheDocument();

    // Check monthly total amounts
    const monthlyRegionalTotal = formatCurrency(
      mockEstimation.regional_currency_costs.monthly_total,
      mockEstimation.regional_currency_costs.currency.symbol,
    );
    const monthlyEmployerTotal = formatCurrency(
      mockEstimation.employer_currency_costs.monthly_total,
      mockEstimation.employer_currency_costs.currency.symbol,
    );

    expect(screen.getByText(monthlyRegionalTotal)).toBeInTheDocument();
    expect(screen.getByText(monthlyEmployerTotal)).toBeInTheDocument();
  });

  it('renders custom components when provided', () => {
    const CustomHeader = vi.fn(() => <div>Custom Header</div>);
    const CustomFooter = vi.fn(() => <div>Custom Footer</div>);

    render(
      <EstimationResults
        {...defaultProps}
        components={{
          Header: CustomHeader,
          Footer: CustomFooter,
        }}
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    expect(CustomHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        title: defaultProps.title,
        country: defaultProps.estimation.country,
        onDelete: defaultProps.onDelete,
        onExportPdf: defaultProps.onExportPdf,
      }),
      expect.anything(),
    );
  });

  it('displays breakdown items correctly', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    // Check if main sections are present
    expect(screen.getByText('Monthly total cost')).toBeInTheDocument();
    expect(screen.getByText('Annual total cost')).toBeInTheDocument();
    expect(screen.getAllByText('Benefits')).toHaveLength(2);
    expect(screen.getAllByText('Mandatory employer costs')).toHaveLength(2);

    // Check if breakdown items are expandable
    const benefitsSection = screen.getAllByText('Benefits')[0];
    fireEvent.click(benefitsSection);

    // Verify that breakdown items are visible
    expect(screen.getByText('Gross monthly salary')).toBeInTheDocument();
    expect(
      screen.getByText('Family - Allianz Premium (Family)'),
    ).toBeInTheDocument();
  });

  it('displays correct currency conversions for benefits', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    // Find and expand Core Benefits section
    const benefitsSection = screen.getAllByText('Benefits')[0];
    fireEvent.click(benefitsSection);

    // Check the Allianz Premium benefit amounts
    const allianzBenefit = screen.getByText(
      'Family - Allianz Premium (Family)',
    );
    expect(allianzBenefit).toBeInTheDocument();

    const expectedRegionalAmount = formatCurrency(
      mockEstimation.regional_currency_costs.monthly_benefits_breakdown[0]
        .amount,
      mockEstimation.regional_currency_costs.currency.symbol,
    );
    const expectedEmployerAmount = formatCurrency(
      mockEstimation.employer_currency_costs.monthly_benefits_breakdown[0]
        .amount,
      mockEstimation.employer_currency_costs.currency.symbol,
    );

    // Find the amounts in the document
    expect(screen.getByText(expectedRegionalAmount)).toBeInTheDocument();
    expect(screen.getByText(expectedEmployerAmount)).toBeInTheDocument();

    // Also verify the total core benefits
    const totalRegionalAmount = formatCurrency(
      mockEstimation.regional_currency_costs.monthly_benefits_total,
      mockEstimation.regional_currency_costs.currency.symbol,
    );
    const totalEmployerAmount = formatCurrency(
      mockEstimation.employer_currency_costs.monthly_benefits_total,
      mockEstimation.employer_currency_costs.currency.symbol,
    );

    expect(screen.getByText(totalRegionalAmount)).toBeInTheDocument();
    expect(screen.getByText(totalEmployerAmount)).toBeInTheDocument();
  });

  it('renders onboarding timeline correctly', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    expect(screen.getByText('Onboarding timeline')).toBeInTheDocument();
    expect(screen.getByText('5 days')).toBeInTheDocument();

    // Expand timeline
    const timelineSection = screen.getByText('Onboarding timeline');
    fireEvent.click(timelineSection);

    // Check timeline steps
    expect(screen.getByText('Add employment details')).toBeInTheDocument();
    expect(screen.getByText('Invite employee')).toBeInTheDocument();
    expect(screen.getByText('Verify information')).toBeInTheDocument();
    expect(screen.getByText('Sign contract')).toBeInTheDocument();
  });

  it('renders hiring section with correct links', () => {
    render(<EstimationResults {...defaultProps} />, { wrapper: TestProviders });

    const hiringSection = screen.getByText(
      `Hiring in ${mockEstimation.country.name}`,
    );
    fireEvent.click(hiringSection);

    const benefitsLink = screen.getByText(/Explore our available benefits/i);
    const guideLink = screen.getByText(/Explore our complete guide/i);

    expect(benefitsLink).toHaveAttribute(
      'href',
      mockEstimation.country_benefits_details_url,
    );
    expect(guideLink).toHaveAttribute('href', mockEstimation.country_guide_url);
  });
});
