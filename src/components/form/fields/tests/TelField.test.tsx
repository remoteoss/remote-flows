/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { TelField, TelFieldDataProps } from '../TelField';
import { TelFieldDefault } from '../default/TelFieldDefault';

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('TelField Component', () => {
  const mockOptions: TelFieldDataProps['options'] = [
    {
      value: 'US',
      label: 'United States',
      pattern: '^(\\+1)[0-9]{10}$',
      meta: { countryCode: '1' },
    },
    {
      value: 'CA',
      label: 'Canada',
      pattern: '^(\\+1)(204|226|236)[0-9]{7}$',
      meta: { countryCode: '1' },
    },
    {
      value: 'GB',
      label: 'United Kingdom',
      pattern: '^(\\+44)[0-9]{10}$',
      meta: { countryCode: '44' },
    },
    {
      value: 'FR',
      label: 'France',
      pattern: '^(\\+33)[0-9]{9}$',
      meta: { countryCode: '33' },
    },
  ];

  const defaultProps: TelFieldDataProps = {
    name: 'phoneNumber',
    label: 'Phone Number',
    description: 'Enter your phone number',
    type: 'tel',
    computedAttributes: {},
    errorMessage: { required: 'Phone number is required' },
    inputType: 'tel' as const,
    isVisible: true,
    jsonType: 'string',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
    options: mockOptions,
  };

  const renderWithFormContext = (
    props: TelFieldDataProps,
    defaultValues?: any,
  ) => {
    const TestComponent = () => {
      const methods = useForm({
        mode: 'onChange',
        defaultValues: defaultValues || {},
      });
      return (
        <FormProvider {...methods}>
          <TelField {...props} />
        </FormProvider>
      );
    };
    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockReturnValue({
      components: { tel: TelFieldDefault },
    });
  });

  it('renders the tel field correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('Enter your phone number')).toBeInTheDocument();
  });

  it('shows error when phone number does not start with +', async () => {
    const user = userEvent.setup();
    renderWithFormContext(defaultProps);

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '1234567890');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Must start with +')).toBeInTheDocument();
    });
  });

  it('accepts valid US phone number', async () => {
    const user = userEvent.setup();
    renderWithFormContext(defaultProps);

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '+12025551234');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/Invalid/)).not.toBeInTheDocument();
      expect(
        screen.queryByText('Unknown country code'),
      ).not.toBeInTheDocument();
    });
  });

  it('accepts valid UK phone number', async () => {
    const user = userEvent.setup();
    renderWithFormContext(defaultProps);

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '+441234567890');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/Invalid/)).not.toBeInTheDocument();
    });
  });

  it('validates Canadian area code correctly (longest match)', async () => {
    const user = userEvent.setup();
    renderWithFormContext(defaultProps);

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '+12041234567');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/Invalid/)).not.toBeInTheDocument();
      expect(
        screen.queryByText('Unknown country code'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows error for unknown country code', async () => {
    const user = userEvent.setup();
    renderWithFormContext(defaultProps);

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '+999123456789');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Unknown country code')).toBeInTheDocument();
    });
  });

  it('shows error when format is invalid for matched country', async () => {
    const user = userEvent.setup();
    renderWithFormContext(defaultProps);

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '+4412345');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Invalid 44 phone number')).toBeInTheDocument();
    });
  });

  it('calls custom onChange handler when provided', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '+1');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('uses custom tel component when provided', () => {
    const CustomTelField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-tel'>Custom Tel Field</div>
      ));

    renderWithFormContext({ ...defaultProps, component: CustomTelField });

    expect(screen.getByTestId('custom-tel')).toBeInTheDocument();
    expect(CustomTelField).toHaveBeenCalled();
  });
});
