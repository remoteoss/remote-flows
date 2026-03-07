/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { CountryField } from '../CountryField';
import { JSFField } from '@/src/types/remoteFlows';
import { defaultComponents } from '@/src/tests/defaultComponents';

// Mock dependencies
vi.mock('@/src/context');

type CountryFieldProps = JSFField & {
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (value: any) => void;
  $meta: {
    regions: Record<string, string[]>;
    subregions: Record<string, string[]>;
  };
};

describe('CountryField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: CountryFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'string',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'select' as const,
    isVisible: true,
    jsonType: 'string',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
    options: [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
    ],
    $meta: {
      regions: {
        'North America': ['US', 'CA'],
      },
      subregions: {
        'Northern America': ['US', 'CA'],
      },
    },
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: CountryFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <CountryField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockImplementation(() => ({
      components: {
        countries: defaultComponents.countries,
      },
    }));
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles country selection change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'US' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom select component when provided', () => {
    const CustomSelectField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-select-field'>Custom Select Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { countries: CustomSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomSelectField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-select-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomSelectField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-select-field'>Custom Select Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { countries: CustomSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomSelectField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom select component', () => {
    const CustomSelectField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (value: string) => {
        field.onChange(value);
      };

      return (
        <select
          data-testid='custom-select'
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value='US'>United States</option>
          <option value='CA'>Canada</option>
        </select>
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { countries: CustomSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customSelect = screen.getByTestId('custom-select');
    fireEvent.change(customSelect, { target: { value: 'US' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomCountryFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='context-country-field'>Context Country Field</div>
      ));
    const CustomCountryFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-country-field'>Prop Country Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { countries: CustomCountryFieldFromContext },
    });

    renderWithFormContext({
      ...(defaultProps as any),
      onChange: mockOnChange,
      component: CustomCountryFieldProp,
    });

    expect(CustomCountryFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-country-field')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-country-field'),
    ).not.toBeInTheDocument();
  });
});
