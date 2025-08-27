import type { CostCalculatorFlowProps } from '@/src/flows/CostCalculator/CostCalculatorFlow';
import { CostCalculatorFlow } from '@/src/flows/CostCalculator/CostCalculatorFlow';
import { CostCalculatorForm } from '@/src/flows/CostCalculator/CostCalculatorForm';
import { CostCalculatorResetButton } from '@/src/flows/CostCalculator/CostCalculatorResetButton';
import { CostCalculatorSubmitButton } from '@/src/flows/CostCalculator/CostCalculatorSubmitButton';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import {
  countries,
  currencies,
  estimation,
  regionFields,
  regionFieldsWithAgeProperty,
} from './fixtures';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();
const onResetHandler = vi.fn();

const defaultProps = {
  defaultValues: {
    countryRegionSlug: 'POL',
    currencySlug: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
    salary: '50000',
  },
};

function renderComponent(
  props: Omit<CostCalculatorFlowProps, 'render'> = {
    defaultValues: defaultProps.defaultValues,
  },
  onReset: typeof onResetHandler = onResetHandler,
) {
  return render(
    <CostCalculatorFlow
      {...props}
      render={(props) => {
        if (props.isLoading) {
          return <div data-testid="loading">Loading...</div>;
        }
        return (
          <div>
            <CostCalculatorForm
              onSubmit={mockOnSubmit}
              onError={mockOnError}
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
    { wrapper },
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
        salary: 5_000_000,
        salary_converted: 'salary_conversion',
        salary_conversion: 5000000,
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

  it('should display validation errors when form is submitted with empty fields', async () => {
    renderComponent({ defaultValues: {} });
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(screen.getByText(/salary is required/i)).toBeInTheDocument();
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
        salary: 5_000_000,
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
            return <div data-testid="loading">Loading...</div>;
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
      { wrapper },
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
            return <div data-testid="loading">Loading...</div>;
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
      { wrapper },
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

  it('should show management fee field when includeManagementFee is true', async () => {
    renderComponent({
      defaultValues: defaultProps.defaultValues,
      estimationOptions: {
        title: 'Test',
        includeBenefits: true,
        includeCostBreakdowns: true,
        includePremiumBenefits: true,
        includeManagementFee: true,
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('textbox', { name: /management fee/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: /management fee/i }),
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
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const managementFeeInput = screen.getByRole('textbox', {
      name: /management fee/i,
    });

    await waitFor(() => {
      expect(managementFeeInput).toHaveValue('699');
    });

    await user.clear(managementFeeInput);
    await user.type(managementFeeInput, '599');

    fireEvent.click(screen.getByRole('button', { name: /Get estimate/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'POL',
          currency: 'usd-1dee66d1-9c32-4ef8-93c6-6ae1ee6308c8',
          salary: 5_000_000,
          salary_converted: 'salary_conversion',
          salary_conversion: 5000000,
          management: {
            management_fee: 59900,
          },
        }),
      );
    });
  });
});
