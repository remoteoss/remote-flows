import type { CostCalculatorFlowProps } from '@/src/flows/CostCalculator/CostCalculatorFlow';
import { CostCalculatorFlow } from '@/src/flows/CostCalculator/CostCalculatorFlow';
import { CostCalculatorForm } from '@/src/flows/CostCalculator/CostCalculatorForm';
import { CostCalculatorResetButton } from '@/src/flows/CostCalculator/CostCalculatorResetButton';
import { CostCalculatorSubmitButton } from '@/src/flows/CostCalculator/CostCalculatorSubmitButton';
import { server } from '@/src/tests/server';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  countries,
  currencies,
  estimation,
  regionFields,
  regionFieldsWithAgeProperty,
  regionFieldsWithContractDurationTypeProperty,
} from './fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  assertRadioValue,
  fillSelect,
  TestProviders,
} from '@/src/tests/testHelpers';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();
const mockOnErrorWithFields = vi.fn();
const onResetHandler = vi.fn();

const defaultProps = {
  defaultValues: {
    countryRegionSlug: 'POL',
    hiringBudget: 'my_hiring_budget',
    currencySlug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
    salary: '50000',
  },
};

function renderComponent(
  props: Omit<CostCalculatorFlowProps, 'render'> = {
    defaultValues: defaultProps.defaultValues,
  },
  onReset: typeof onResetHandler = onResetHandler,
  onErrorWithFields?: typeof mockOnErrorWithFields,
) {
  return render(
    <CostCalculatorFlow
      {...props}
      render={(props) => {
        if (props.isLoading) {
          return <div data-testid='loading'>Loading...</div>;
        }
        return (
          <div>
            <CostCalculatorForm
              onSubmit={mockOnSubmit}
              onError={!onErrorWithFields ? mockOnError : undefined}
              onErrorWithFields={
                onErrorWithFields ? onErrorWithFields : undefined
              }
              onSuccess={mockOnSuccess}
            />
            <CostCalculatorSubmitButton>
              Get estimate
            </CostCalculatorSubmitButton>
            <CostCalculatorResetButton onClick={onReset}>
              Reset
            </CostCalculatorResetButton>
          </div>
        );
      }}
    />,
    { wrapper: TestProviders },
  );
}

describe('CostCalculatorFlow', () => {
  beforeEach(() => {
    server.use(
      ...[
        http.get('*/v1/cost-calculator/countries', () => {
          return HttpResponse.json(countries);
        }),
        http.get('*/v1/company-currencies', () => {
          return HttpResponse.json(currencies);
        }),
        http.get('*/v1/cost-calculator/regions/*/fields', () => {
          return HttpResponse.json(regionFields);
        }),
        http.post('*/v1/cost-calculator/estimation', () => {
          return HttpResponse.json(estimation);
        }),
      ],
    );
    vi.clearAllMocks();
  });

  it('should render the form with default values', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const comboboxes = screen.getAllByRole('combobox');
    const countryDropdown = comboboxes[0];
    const currencyDropdown = comboboxes[1];
    const salaryInput = screen.getByRole('textbox', { name: /salary/i });

    await waitFor(() => {
      expect(countryDropdown).toHaveTextContent(/Poland/i);
    });

    expect(currencyDropdown).toHaveTextContent(/USD/i);
    await waitFor(() => {
      expect(salaryInput).toHaveValue('50000');
    });
    expect(screen.getByText(/Show PLN conversion/i)).toBeInTheDocument();
    const hiringBudgetRadio = screen.getByRole('radio', {
      name: /my hiring budget/i,
    });
    expect(hiringBudgetRadio).toBeChecked();
  });

  it('should render the 3 comboboxes when selecting a country with region', async () => {
    renderComponent({
      defaultValues: {
        ...defaultProps.defaultValues,
        countryRegionSlug: 'ESP',
      },
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(3);
    });
  });

  it('should have selected Asturias as the region', async () => {
    renderComponent({
      defaultValues: {
        ...defaultProps.defaultValues,
        countryRegionSlug: 'ESP',
        regionSlug: 'AST',
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /Region/i }),
      ).toHaveTextContent(/Asturias/i);
    });
  });

  it('should submit the form with default values', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        country: 'POL',
        currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        currency_code: 'USD',
        salary: 5_000_000,
        hiring_budget: 'my_hiring_budget',
        salary_converted: 'salary_conversion',
        salary_conversion: 5000000,
        estimation_title: 'Estimation',
      });
    });
  });

  it('should call onSuccess callback when estimation succeeds', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        return HttpResponse.json({ data: {} });
      }),
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should call onError callback when estimation fails', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        return new HttpResponse('Not found', { status: 422 });
      }),
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  it('should call onErrorWithFields callback when estimation fails', async () => {
    server.use(
      http.post('*/v1/cost-calculator/estimation', () => {
        return HttpResponse.json(
          {
            errors: {
              employer_currency_slug: ['Missing field'],
            },
          },
          { status: 422 },
        );
      }),
    );
    renderComponent(undefined, undefined, mockOnErrorWithFields);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnErrorWithFields).toHaveBeenCalled();
    });

    expect(mockOnErrorWithFields).toHaveBeenCalledWith({
      rawError: {
        errors: {
          employer_currency_slug: ['Missing field'],
        },
      },
      error: new Error('Something went wrong. Please try again later.'),
      fieldErrors: [
        {
          field: 'employer_currency_slug',
          messages: ['Missing field'],
          userFriendlyLabel: 'Currency',
        },
      ],
    });
  });

  it('should display validation errors when form is submitted with empty fields', async () => {
    renderComponent({ defaultValues: {} });
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(3);
    });
  });

  it('should load the form with regional fields based on the selected country', async () => {
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Benefits')).toBeInTheDocument();
    expect(screen.getByLabelText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByLabelText('Life Insurance')).toBeInTheDocument();
  });

  it('should load the form with age field already filled', async () => {
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    renderComponent({
      defaultValues: {
        ...defaultProps.defaultValues,
        age: 30,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox', { name: /age/i })).toHaveValue('30');
  });

  it('should load the form with contract duration type field already filled', async () => {
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithContractDurationTypeProperty);
      }),
    );

    renderComponent({
      defaultValues: {
        ...defaultProps.defaultValues,
        contractDurationType: 'fixed',
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await assertRadioValue('Contract duration', 'Fixed Term');
  });

  it('should load, fill and submit form with regional fields', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    // type age
    await user.type(
      screen.getByRole('textbox', {
        name: /age/i,
      }),
      '30',
    );

    // select benefits
    const [, , lifeInsurance, healthInsurance] =
      screen.getAllByRole('combobox');

    // select life insurance
    await user.click(lifeInsurance);
    const [, healthInsuranceOption] = screen.getAllByText(
      'Option 1 - 5.64 USD/mo',
    );
    await user.click(healthInsuranceOption);

    // select health insurance
    await user.click(healthInsurance);
    const [, lifeInsuranceOption] = screen.getAllByText(
      'Option 1 - 113 USD/mo',
    );
    await user.click(lifeInsuranceOption);

    // submit form
    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        age: 30,
        benefits: {
          'benefit-53c5fc69-f299-47e7-9004-86def3f0e845':
            '8a32160f-62cb-4fd7-b90a-47b92e8bb734',
          'benefit-b5b325b7-f997-4679-9e63-bd77d8d1ed1f':
            'df47a18f-ee55-4fd8-ab53-9eefe937c4e1',
        },
        country: 'POL',
        currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        currency_code: 'USD',
        salary: 5_000_000,
        estimation_title: 'Estimation',
        hiring_budget: 'my_hiring_budget',
        salary_converted: 'salary_conversion',
        salary_conversion: 5000000,
      });
    });
  });

  it("should reset to the initial form values when the 'Reset' button is clicked", async () => {
    const user = userEvent.setup();

    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    // type age
    await user.type(
      screen.getByRole('textbox', {
        name: /age/i,
      }),
      '30',
    );

    // submit form
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', {
          name: /age/i,
        }),
      ).toHaveValue('');
    });
  });

  it('should change the form fields labels from the consumer API', async () => {
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    renderComponent({
      options: {
        jsfModify: {
          fields: {
            age: {
              title: 'Enter your age',
            },
            salary: {
              title: 'Enter your salary',
            },
          },
        },
      },
      defaultValues: defaultProps.defaultValues,
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toBeInTheDocument();
    });

    await screen.findByText(/Enter your age/i);
    await screen.findByText(/Enter your salary/i);
  });

  it('should reset form after successful submission when shouldResetForm is true', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    render(
      <CostCalculatorFlow
        defaultValues={defaultProps.defaultValues}
        render={(props) => {
          if (props.isLoading) {
            return <div data-testid='loading'>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={mockOnSubmit}
                onError={mockOnError}
                onSuccess={mockOnSuccess}
                shouldResetForm={true}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Fill in the age field
    await user.type(
      screen.getByRole('textbox', {
        name: /age/i,
      }),
      '30',
    );

    // select benefits
    const [, , lifeInsurance, healthInsurance] =
      screen.getAllByRole('combobox');

    // select life insurance
    await user.click(lifeInsurance);
    const [, healthInsuranceOption] = screen.getAllByText(
      'Option 1 - 5.64 USD/mo',
    );
    await user.click(healthInsuranceOption);

    // select health insurance
    await user.click(healthInsurance);
    const [, lifeInsuranceOption] = screen.getAllByText(
      'Option 1 - 113 USD/mo',
    );
    await user.click(lifeInsuranceOption);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    // Wait for success callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Verify form was reset
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /age/i,
        }),
      ).toHaveValue('');
    });
  });

  it("should reset form the country and region when the 'resetFields' is passed", async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/v1/cost-calculator/regions/*/fields', () => {
        return HttpResponse.json(regionFieldsWithAgeProperty);
      }),
    );

    render(
      <CostCalculatorFlow
        defaultValues={defaultProps.defaultValues}
        render={(props) => {
          if (props.isLoading) {
            return <div data-testid='loading'>Loading...</div>;
          }
          return (
            <div>
              <CostCalculatorForm
                onSubmit={mockOnSubmit}
                onError={mockOnError}
                onSuccess={mockOnSuccess}
                resetFields={['country']}
              />
              <CostCalculatorSubmitButton>
                Get estimate
              </CostCalculatorSubmitButton>
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Fill in the age field
    await user.type(
      screen.getByRole('textbox', {
        name: /age/i,
      }),
      '30',
    );

    // select benefits
    const [, , lifeInsurance, healthInsurance] =
      screen.getAllByRole('combobox');

    // select life insurance
    await user.click(lifeInsurance);
    const [, healthInsuranceOption] = screen.getAllByText(
      'Option 1 - 5.64 USD/mo',
    );
    await user.click(healthInsuranceOption);

    // select health insurance
    await user.click(healthInsurance);
    const [, lifeInsuranceOption] = screen.getAllByText(
      'Option 1 - 113 USD/mo',
    );
    await user.click(lifeInsuranceOption);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    // Wait for success callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Verify form was reset
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', {
          name: /country/i,
        }),
      ).toHaveTextContent('Country');
    });

    expect(
      screen.queryByRole('combobox', {
        name: /region/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('textbox', {
        name: /salary/i,
      }),
    ).toHaveValue('50000');

    expect(
      screen.getByRole('combobox', {
        name: /currency/i,
      }),
    ).toHaveTextContent(/USD/i);
  });

  it('should not show management fee field when includeManagementFee is false && showManagementFee is false', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        includeManagementFee: false,
        showManagementFee: false,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /management fee/i }),
    ).not.toBeInTheDocument();
  });

  it('should not show management fee field when includeManagementFee is true && showManagementFee is false', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        includeManagementFee: true,
        showManagementFee: false,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /management fee/i }),
    ).not.toBeInTheDocument();
  });

  it('should show management fee field when includeManagementFee is true && showManagementFee is true', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Show Management fee' }),
      ).toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    expect(
      screen.getByRole('textbox', { name: /desired monthly management fee/i }),
    ).toHaveValue('699');
  });

  it('should hide management fee field when includeManagementFee is false', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: false,
        showManagementFee: false,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /management fee/i }),
    ).not.toBeInTheDocument();
  });

  it('should submit form with management fee when field is visible and filled', async () => {
    const user = userEvent.setup();

    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Show Management fee' }),
      ).toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /desired monthly management fee/i,
        }),
      ).toBeInTheDocument();
    });

    const managementFeeInput = screen.getByRole('textbox', {
      name: /desired monthly management fee/i,
    });

    await waitFor(() => {
      expect(managementFeeInput).toHaveValue('699');
    });

    await user.clear(managementFeeInput);
    await user.type(managementFeeInput, '599');

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        country: 'POL',
        currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
        currency_code: 'USD',
        estimation_title: 'Test',
        hiring_budget: 'my_hiring_budget',
        salary: 5_000_000,
        salary_converted: 'salary_conversion',
        salary_conversion: 5000000,
        management: {
          management_fee: 59900,
        },
      });
    });
  });

  it('should show management fee field when includeManagementFee is true and managementFees is present', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
        managementFees: {
          USD: 599,
        } as $TSFixMe,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Show Management fee' }),
      ).toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /desired monthly management fee/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('textbox', {
        name: /desired monthly management fee/i,
      }),
    ).toHaveValue('599');
  });

  it('should show the base rate fee field when includeManagementFee is true and managementFees is present', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
        managementFees: {
          EUR: 530,
        } as $TSFixMe,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Show Management fee' }),
      ).toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /desired monthly management fee/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('textbox', {
        name: /desired monthly management fee/i,
      }),
    ).toHaveValue('699');
  });

  it('should change the employer billing currency and update the management fee', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Show Management fee' }),
      ).toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /desired monthly management fee/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('textbox', {
        name: /desired monthly management fee/i,
      }),
    ).toHaveValue('699');

    await fillSelect('Currency', 'EUR');

    expect(
      screen.getByRole('textbox', {
        name: /desired monthly management fee/i,
      }),
    ).toHaveValue('645');
  });

  it("should show the default management fee when it's provided", async () => {
    renderComponent({
      defaultValues: {
        ...defaultProps.defaultValues,
        management: {
          management_fee: '100',
        },
      },
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Show Management fee' }),
      ).toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /desired monthly management fee/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('textbox', {
        name: /desired monthly management fee/i,
      }),
    ).toHaveValue('100');
  });

  it('should throw the management fee error when the management fee is above the threshold', async () => {
    const user = userEvent.setup();

    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
        showManagementFee: true,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const defineButton = screen.getByRole('button', {
      name: 'Show Management fee',
    });

    fireEvent.click(defineButton);

    await waitFor(() => {
      expect(defineButton).toHaveAttribute('aria-expanded', 'true');
    });

    const managementFeeInput = screen.getByRole('textbox', {
      name: /management fee/i,
    });
    expect(managementFeeInput).toHaveValue('699');

    await user.clear(managementFeeInput);
    await user.type(managementFeeInput, '700');

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Management fee cannot exceed 699 USD/i),
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  describe('Salary value preservation during currency changes', () => {
    it('should preserve salary value when switching from no conversion to conversion', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Start with USD (no conversion needed)
      const salaryInput = screen.getByRole('textbox', { name: /salary/i });
      fireEvent.change(salaryInput, { target: { value: '75000' } });
      expect(salaryInput).toHaveValue('75000');

      // Switch to EUR (conversion needed)
      await fillSelect('Currency', 'EUR');

      // The value should be preserved in the conversion field
      expect(salaryInput).toHaveValue('75000');
    });

    it('should preserve salary value when switching from conversion to no conversion', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Start with EUR (conversion needed)
      await fillSelect('Currency', 'EUR');

      const salaryInput = screen.getByRole('textbox', { name: /salary/i });
      fireEvent.change(salaryInput, { target: { value: '65000' } });
      expect(salaryInput).toHaveValue('65000');

      // Switch back to USD (no conversion needed)
      await fillSelect('Currency', 'USD');

      // The value should be preserved in the original field
      expect(salaryInput).toHaveValue('65000');
    });

    it('should preserve salary value when switching between different conversion currencies', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Start with EUR
      await fillSelect('Currency', 'EUR');

      const salaryInput = screen.getByRole('textbox', { name: /salary/i });
      fireEvent.change(salaryInput, { target: { value: '55000' } });
      expect(salaryInput).toHaveValue('55000');

      // Switch to GBP (still conversion needed)
      await fillSelect('Currency', 'GBP');

      // The value should be preserved
      expect(salaryInput).toHaveValue('55000');
    });

    it('should preserve salary value when country changes trigger currency changes', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Start with US (USD)
      const salaryInput = screen.getByRole('textbox', { name: /salary/i });
      fireEvent.change(salaryInput, { target: { value: '80000' } });
      expect(salaryInput).toHaveValue('80000');

      // Change country to Spain (EUR)
      await fillSelect('Country', 'Spain');

      // The value should be preserved
      expect(salaryInput).toHaveValue('80000');

      // Change back to US
      await fillSelect('Country', 'United States');

      // The value should still be preserved
      expect(salaryInput).toHaveValue('80000');
    });
  });
});
