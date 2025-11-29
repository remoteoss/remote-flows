import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { string } from 'yup';
import { server } from '@/src/tests/server';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { ButtonComponentProps } from '@/src/types/remoteFlows';
import {
  CurrencyConversionField,
  CurrencyConversionFieldProps,
} from '../CurrencyConversionField';
import {
  conversionFromEURToUSD,
  conversionFromUSDToEUR,
} from '@/src/flows/Onboarding/tests/fixtures';
import { useState } from 'react';

const queryClient = new QueryClient();

const defaultProps: CurrencyConversionFieldProps = {
  name: 'test_salary',
  label: 'Test Salary',
  description: 'Enter your test salary',
  sourceCurrency: 'USD',
  targetCurrency: 'EUR',
  conversionFieldName: 'test_salary_conversion',
  classNamePrefix: 'RemoteFlows-TestSalary',
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
        [props.name]: '',
        [props.conversionFieldName]: '',
      },
      mode: 'onChange',
    });

    return (
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider components={{}}>
          <FormProvider {...methods}>
            <CurrencyConversionField {...props} />
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
  props = defaultProps,
) => {
  const TestComponent = () => {
    const methods = useForm({
      defaultValues: {
        [props.name]: '',
        [props.conversionFieldName]: '',
      },
      mode: 'onChange',
    });

    return (
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider components={{ button: CustomButton }}>
          <FormProvider {...methods}>
            <CurrencyConversionField {...props} />
          </FormProvider>
        </FormFieldsProvider>
      </QueryClientProvider>
    );
  };

  return render(<TestComponent />);
};

describe('CurrencyFieldWithConversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.post('*/v1/currency-converter/effective', async ({ request }) => {
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

    expect(screen.getByLabelText('Test Salary')).toBeInTheDocument();
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
    const input = screen.getByLabelText('Test Salary');
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
      const mainInput = screen.getByLabelText('Test Salary');
      expect(mainInput).toHaveValue('1176.47'); // 1000 EUR = 1176.47 USD (using 0.85 exchange rate)
    });
  });

  it('caches conversions in both directions', async () => {
    const mockHandler = vi.fn(async ({ request }) => {
      const body = await request.json();
      if (body.source_currency === 'EUR' && body.target_currency === 'USD') {
        return HttpResponse.json({
          data: {
            conversion_data: {
              exchange_rate: '1.1',
              target_currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
              source_currency: { code: 'EUR', name: 'Euro', symbol: '€' },
              source_amount: body.amount,
              target_amount: (body.amount * 1.1).toFixed(2),
            },
          },
        });
      }
      if (body.source_currency === 'USD' && body.target_currency === 'EUR') {
        return HttpResponse.json({
          data: {
            conversion_data: {
              exchange_rate: '0.91',
              target_currency: { code: 'EUR', name: 'Euro', symbol: '€' },
              source_currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
              source_amount: body.amount,
              target_amount: (body.amount * 0.91).toFixed(2),
            },
          },
        });
      }
      return HttpResponse.json({});
    });

    server.use(http.post('*/v1/currency-converter/effective', mockHandler));

    const props = {
      ...defaultProps,
      sourceCurrency: 'EUR',
      targetCurrency: 'USD',
    };

    renderWithFormContext(props);

    // Enable conversion
    const toggleButton = screen.getByText('Show USD conversion');
    fireEvent.click(toggleButton);

    // Type in the main field (EUR)
    const input = screen.getByLabelText('Test Salary');
    fireEvent.change(input, { target: { value: '100' } });

    // Wait for the conversion to happen (EUR -> USD)
    await waitFor(() => {
      const conversionInput = screen.getByLabelText('Conversion');
      expect(conversionInput).toHaveValue('110.00');
    });

    // Now type the cached USD value in the conversion field (USD -> EUR)
    const conversionInput = screen.getByLabelText('Conversion');
    fireEvent.change(conversionInput, { target: { value: '110.00' } });

    // Wait for the main field to be updated using the cache (should be '100')
    await waitFor(() => {
      const mainInput = screen.getByLabelText('Test Salary');
      expect(mainInput).toHaveValue('100');
    });

    // The backend should only be called once for each direction
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('converts initial value when toggling conversion field', async () => {
    renderWithFormContext();

    // First set a value in the main field
    const input = screen.getByLabelText('Test Salary');
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

  it('does not show conversion toggle when currencies are the same', () => {
    const propsWithSameCurrency = {
      ...defaultProps,
      sourceCurrency: 'USD',
      targetCurrency: 'USD',
    };

    renderWithFormContext(propsWithSameCurrency);

    expect(screen.queryByText('Show USD conversion')).not.toBeInTheDocument();
  });

  it('uses custom conversion field name', async () => {
    const propsWithCustomFieldName = {
      ...defaultProps,
      conversionFieldName: 'custom_conversion_field',
    };

    renderWithFormContext(propsWithCustomFieldName);

    // Enable conversion
    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    // The field should be rendered and work with the custom name
    await waitFor(() => {
      expect(screen.getByLabelText('Conversion')).toBeInTheDocument();
    });
  });

  it('uses custom conversion properties', async () => {
    const propsWithCustomProperties = {
      ...defaultProps,
      conversionProperties: {
        label: 'Custom Conversion Label',
        description: 'Custom conversion description',
      },
    };

    renderWithFormContext(propsWithCustomProperties);

    // Enable conversion
    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(
        screen.getByLabelText('Custom Conversion Label'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Custom conversion description'),
      ).toBeInTheDocument();
    });
  });

  it('uses custom class name prefix', () => {
    const propsWithCustomPrefix = {
      ...defaultProps,
      classNamePrefix: 'CustomPrefix',
    };

    renderWithFormContext(propsWithCustomPrefix);

    // Check that the custom class name is applied
    const descriptionElement = screen.getByText(
      /Enter your test salary/i,
    ).parentElement;
    expect(descriptionElement).toHaveClass('CustomPrefix-description');
  });

  it('resets conversion field when source currency changes', async () => {
    const TestComponent = () => {
      const [sourceCurrency, setSourceCurrency] = useState('USD');
      const methods = useForm({
        defaultValues: {
          test_salary: '',
          test_salary_conversion: 'existing_value',
        },
        mode: 'onChange',
      });

      return (
        <QueryClientProvider client={queryClient}>
          <FormFieldsProvider components={{}}>
            <FormProvider {...methods}>
              <CurrencyConversionField
                {...defaultProps}
                sourceCurrency={sourceCurrency}
              />
              <button
                data-testid='change-currency'
                onClick={() => setSourceCurrency('GBP')}
              >
                Change Currency
              </button>
            </FormProvider>
          </FormFieldsProvider>
        </QueryClientProvider>
      );
    };

    render(<TestComponent />);

    // Initially, the conversion field should have the existing value
    const toggleButton = screen.getByText('Show EUR conversion');
    fireEvent.click(toggleButton);

    const conversionInput = screen.getByLabelText('Conversion');
    expect(conversionInput).toHaveValue('existing_value');

    // Change the source currency
    const changeCurrencyButton = screen.getByTestId('change-currency');
    fireEvent.click(changeCurrencyButton);

    // The conversion field should be reset to empty
    expect(conversionInput).toHaveValue('');
  });

  describe('with custom button component', () => {
    it('passes all props to custom button component', () => {
      const CustomButton = vi
        .fn()
        .mockImplementation(({ children, onClick, ...props }) => (
          <button
            data-testid='custom-button'
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
          className: 'RemoteFlows-TestSalary-button',
          'data-type': 'inline',
        }),
        {},
      );

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveClass('RemoteFlows-TestSalary-button');
      expect(button).toHaveAttribute('data-type', 'inline');
    });

    it('toggles button text correctly', () => {
      const CustomButton = vi
        .fn()
        .mockImplementation(({ children, onClick, ...props }) => (
          <button
            data-testid='custom-button'
            onClick={onClick}
            data-type={props['data-type']}
            className={props.className}
          >
            {children}
          </button>
        ));

      renderWithCustomButton(CustomButton);

      const button = screen.getByTestId('custom-button');

      // Initially shows "Show EUR conversion"
      expect(button).toHaveTextContent('Show EUR conversion');

      // After clicking, should show "Hide EUR conversion"
      fireEvent.click(button);
      expect(button).toHaveTextContent('Hide EUR conversion');
    });
  });
});
