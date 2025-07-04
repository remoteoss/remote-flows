import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { string } from 'yup';
import { JSFField } from '@/src/types/remoteFlows';
import { server } from '@/src/tests/server';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { ButtonComponentProps } from '@/src/types/remoteFlows';
import { AnnualGrossSalary } from '../components/AnnualGrossSalary';
import {
  conversionFromEURToUSD,
  conversionFromUSDToEUR,
} from '@/src/flows/Onboarding/tests/fixtures';

const queryClient = new QueryClient();

const defaultProps: JSFField & {
  currency: string;
  desiredCurrency: string;
} = {
  name: 'annual_gross_salary',
  label: 'Annual Gross Salary',
  description: 'Enter your annual gross salary',
  currency: 'USD',
  desiredCurrency: 'EUR',
  computedAttributes: {},
  errorMessage: {},
  inputType: 'text',
  isVisible: true,
  required: false,
  jsonType: 'string',
  schema: string(),
  scopedJsonSchema: {},
  type: 'text',
};

// Helper function to render the component with a form context
const renderWithFormContext = (props = defaultProps) => {
  const TestComponent = () => {
    const methods = useForm({
      defaultValues: {
        annual_gross_salary: '',
        annual_gross_salary_conversion: '',
      },
      mode: 'onChange',
    });

    return (
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider components={{}}>
          <FormProvider {...methods}>
            <AnnualGrossSalary {...props} />
          </FormProvider>
        </FormFieldsProvider>
      </QueryClientProvider>
    );
  };

  return render(<TestComponent />);
};

// Helper function to render with a custom button
const renderWithCustomButton = (
  CustomButton: React.ComponentType<ButtonComponentProps>,
) => {
  const TestComponent = () => {
    const methods = useForm({
      defaultValues: {
        annual_gross_salary: '',
        annual_gross_salary_conversion: '',
      },
      mode: 'onChange',
    });

    return (
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider components={{ button: CustomButton }}>
          <FormProvider {...methods}>
            <AnnualGrossSalary {...defaultProps} />
          </FormProvider>
        </FormFieldsProvider>
      </QueryClientProvider>
    );
  };

  return render(<TestComponent />);
};

describe('AnnualGrossSalary', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.post('*/v1/currency-converter', async ({ request }) => {
        const body = (await request.json()) as {
          source_currency: string;
          target_currency: string;
          amount: number;
        };

        // If converting from USD to EUR
        if (body.source_currency === 'USD' && body.target_currency === 'EUR') {
          return HttpResponse.json(conversionFromUSDToEUR);
        }

        // If converting from EUR to USD
        return HttpResponse.json(conversionFromEURToUSD);
      }),
    );
  });

  it('renders the initial state correctly', () => {
    renderWithFormContext();

    expect(screen.getByLabelText('Annual Gross Salary')).toBeInTheDocument();
    expect(screen.queryByLabelText('Conversion')).not.toBeInTheDocument();
  });

  it('shows conversion field when toggle is clicked', async () => {
    renderWithFormContext();

    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Conversion')).toBeInTheDocument();
    });
  });

  it('handles input change and converts currency', async () => {
    renderWithFormContext();

    // Enable conversion
    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    // Type in the main field
    const input = screen.getByLabelText('Annual Gross Salary');
    fireEvent.change(input, { target: { value: '1000' } });

    // Wait for the conversion to happen
    await waitFor(() => {
      const conversionInput = screen.getByLabelText('Conversion');
      expect(conversionInput).toHaveValue('850');
    });
  });

  it('handles conversion field change and converts back', async () => {
    renderWithFormContext();

    // Enable conversion
    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    // Type in the conversion field
    const conversionInput = screen.getByLabelText('Conversion');
    fireEvent.change(conversionInput, { target: { value: '1000' } });

    // Wait for the main field to be updated
    await waitFor(() => {
      const mainInput = screen.getByLabelText('Annual Gross Salary');
      expect(mainInput).toHaveValue('1176.47'); // 1000 EUR = 1176.47 USD (using 0.85 exchange rate)
    });
  });

  it('converts initial value when toggling conversion field', async () => {
    renderWithFormContext();

    // First set a value in the main field
    const input = screen.getByLabelText('Annual Gross Salary');
    fireEvent.change(input, { target: { value: '1000' } });

    // Then toggle the conversion field
    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    // Wait for the conversion to happen
    await waitFor(() => {
      const conversionInput = screen.getByLabelText('Conversion');
      expect(conversionInput).toHaveValue('850');
    });
  });

  describe('with custom button component', () => {
    it('passes all props to custom button component', () => {
      const CustomButton = vi
        .fn()
        .mockImplementation(({ children, onClick, ...props }) => (
          <button
            data-testid="custom-button"
            onClick={onClick}
            data-type={props['data-type']}
            className={props.className}
          >
            {children}
          </button>
        ));

      renderWithCustomButton(CustomButton);

      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          children: 'Show EUR conversion',
          onClick: expect.any(Function),
          className: 'RemoteFlows-AnnualGrossSalary-button',
          'data-type': 'inline',
        }),
        {},
      );

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveClass('RemoteFlows-AnnualGrossSalary-button');
      expect(button).toHaveAttribute('data-type', 'inline');
    });
  });
});
