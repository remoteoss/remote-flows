/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { TelField, TelFieldDataProps } from '../TelField';
import { TelFieldDefault } from '../default/TelFieldDefault';
import { yupResolver } from '@hookform/resolvers/yup';

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

// Helper function to interact with Radix UI Select
async function fillRadixSelect(labelText: string, optionText: string) {
  const user = userEvent.setup();

  const trigger = screen.getByLabelText(labelText);
  await user.click(trigger);

  await waitFor(() => {
    expect(
      screen.getByRole('option', { name: new RegExp(optionText, 'i') }),
    ).toBeInTheDocument();
  });

  const option = screen.getByRole('option', {
    name: new RegExp(optionText, 'i'),
  });
  await user.click(option);
}

// Helper to fill phone number input
async function fillPhoneInput(phoneNumber: string) {
  const user = userEvent.setup();
  const phoneInput = screen.getByLabelText('Phone number');
  await user.type(phoneInput, phoneNumber);
}

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
    value: 'ES',
    label: 'Spain',
    pattern: '^(\\+34)[0-9]{9}$',
    meta: { countryCode: '34' },
  },
];

const createTelSchema = (options: TelFieldDataProps['options']) => {
  return string()
    .required('Phone number is required')
    .max(30, 'Must be at most 30 characters')
    .matches(/^\+/, 'Must start with +')
    .matches(/^\+\d+$/, 'Phone number can only contain + and digits')
    .test('valid-phone', function (value) {
      if (!value) return true;

      const sortedOptions = [...options].sort(
        (a, b) => b.meta.countryCode.length - a.meta.countryCode.length,
      );

      for (const option of sortedOptions) {
        if (value.startsWith(`+${option.meta.countryCode}`)) {
          const pattern = new RegExp(option.pattern);
          if (!pattern.test(value)) {
            return this.createError({
              message: `Invalid ${option.meta.countryCode} phone number`,
            });
          }
          return true;
        }
      }

      return this.createError({ message: 'Unknown country code' });
    });
};

describe('TelField Component - Split UI', () => {
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
    schema: createTelSchema(mockOptions),
    scopedJsonSchema: {},
    options: mockOptions,
  };

  const renderWithFormContext = (
    props: TelFieldDataProps,
    defaultValues?: any,
  ) => {
    const TestComponent = () => {
      const methods = useForm({
        mode: 'onBlur',
        defaultValues: defaultValues || {},
        resolver: yupResolver(
          object().shape({
            phoneNumber: props.schema,
          }),
        ),
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

  describe('UI Rendering', () => {
    it('renders country select and phone input fields', () => {
      renderWithFormContext(defaultProps);

      expect(screen.getByLabelText('Country code')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
    });

    it('displays all country options in select', async () => {
      const user = userEvent.setup();
      renderWithFormContext(defaultProps);

      const countrySelect = screen.getByLabelText('Country code');
      await user.click(countrySelect);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /United States \+1/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /United Kingdom \+44/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /Spain \+34/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Country Selection', () => {
    it('allows selecting a country from dropdown', async () => {
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');

      await waitFor(() => {
        expect(screen.getByText('United States +1')).toBeInTheDocument();
      });
    });

    it('updates country when user selects different option', async () => {
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');
      await fillRadixSelect('Country code', 'United Kingdom +44');

      await waitFor(() => {
        expect(screen.getByText('United Kingdom +44')).toBeInTheDocument();
      });
    });
  });

  describe('Phone Number Input', () => {
    it('accepts typing in phone number field', async () => {
      renderWithFormContext(defaultProps);

      await fillPhoneInput('5551234567');

      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('5551234567');
    });

    it('combines country code and phone number', async () => {
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');
      await fillPhoneInput('2025551234');

      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('2025551234');
    });

    it('removes spaces from phone number input', async () => {
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');
      await fillPhoneInput('202 555 1234');

      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('2025551234');
    });
  });

  describe('Pre-populated Values', () => {
    it('parses and displays existing international number', () => {
      renderWithFormContext(defaultProps, { phoneNumber: '+442012345678' });

      expect(screen.getByText('United Kingdom +44')).toBeInTheDocument();

      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('2012345678');
    });

    it('parses US number correctly', () => {
      renderWithFormContext(defaultProps, { phoneNumber: '+12025551234' });

      expect(screen.getByText('United States +1')).toBeInTheDocument();
      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('2025551234');
    });

    it('handles Canadian area code numbers', () => {
      renderWithFormContext(defaultProps, { phoneNumber: '+12041234567' });

      expect(screen.getByText('Canada +1')).toBeInTheDocument();
      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('2041234567');
    });

    it('parses Spanish number correctly', () => {
      renderWithFormContext(defaultProps, { phoneNumber: '+34659441270' });

      expect(screen.getByText('Spain +34')).toBeInTheDocument();
      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('659441270');
    });
  });

  describe('Validation', () => {
    it('triggers validation on blur', async () => {
      const user = userEvent.setup();
      renderWithFormContext(defaultProps);

      const phoneInput = screen.getByLabelText('Phone number');
      await user.click(phoneInput);
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Phone number is required'),
        ).toBeInTheDocument();
      });
    });

    it('validates complete phone number on blur', async () => {
      const user = userEvent.setup();
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');
      await fillPhoneInput('123');

      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid 1 phone number')).toBeInTheDocument();
      });
    });

    it('shows no error for valid complete number', async () => {
      const user = userEvent.setup();
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');
      await fillPhoneInput('2025551234');

      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/Invalid/)).not.toBeInTheDocument();
      });
    });

    it('validates UK phone number correctly', async () => {
      const user = userEvent.setup();
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United Kingdom +44');
      await fillPhoneInput('2012345678');

      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/Invalid/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Country Code Changes', () => {
    it('preserves national number when changing country', async () => {
      renderWithFormContext(defaultProps);

      await fillRadixSelect('Country code', 'United States +1');
      await fillPhoneInput('2025551234');
      await fillRadixSelect('Country code', 'United Kingdom +44');

      const phoneInput = screen.getByLabelText('Phone number');
      expect(phoneInput).toHaveValue('2025551234');
    });
  });

  describe('Custom Handlers', () => {
    it('calls onChangeCountryCode when country changes', async () => {
      const mockOnChangeCountry = vi.fn();

      renderWithFormContext({
        ...defaultProps,
        onChangeCountryCode: mockOnChangeCountry,
      });

      await fillRadixSelect('Country code', 'United States +1');

      await waitFor(() => {
        expect(mockOnChangeCountry).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'United States',
            dialCode: '1',
          }),
        );
      });
    });

    it('calls onChangePhoneNumber when typing', async () => {
      const mockOnChangePhone = vi.fn();

      renderWithFormContext({
        ...defaultProps,
        onChangePhoneNumber: mockOnChangePhone,
      });

      await fillRadixSelect('Country code', 'United States +1');
      await fillPhoneInput('5');

      await waitFor(() => {
        expect(mockOnChangePhone).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Component', () => {
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

    it('passes correct props to custom component', () => {
      const CustomTelField = vi
        .fn()
        .mockImplementation(({ fieldData }) => (
          <div data-testid='custom-tel'>{fieldData.currentCountry?.name}</div>
        ));

      renderWithFormContext(
        { ...defaultProps, component: CustomTelField },
        { phoneNumber: '+442012345678' },
      );

      expect(CustomTelField).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldData: expect.objectContaining({
            currentCountry: expect.objectContaining({
              name: 'United Kingdom',
              dialCode: '44',
            }),
            nationalPhoneNumber: '2012345678',
          }),
        }),
        expect.anything(),
      );
    });
  });
});
