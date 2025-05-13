/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { string } from 'yup';
import { CountryField } from '../CountryField';
import { JSFField } from '@/src/types/remoteFlows';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(() => ({ components: {} })),
}));

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
    (useFormFields as any).mockImplementation(() => ({ components: {} }));
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
    fireEvent.click(select);

    // Now options should be visible
    const option = screen.getByText('United States');
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it.only('renders custom select component when provided', () => {
    const CustomSelectField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-select-field">Custom Select Field</div>
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
        <div data-testid="custom-select-field">Custom Select Field</div>
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
          data-testid="custom-select"
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
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

  it('displays regions and subregions in the options list', () => {
    renderWithFormContext(defaultProps);

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    // Check if regions and subregions are displayed
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('Northern America')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('handles selecting and removing a country', async () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    // Open the select
    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(select);
    });

    // Wait for the popover to open and options to be visible
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Select a country
    const option = screen.getByRole('option', { name: 'United States' });
    await act(async () => {
      fireEvent.click(option);
    });

    // Wait for the selection to be processed
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(['US']);
    });

    // Find and click the remove button
    const removeButton = screen.getByRole('button', {
      name: /remove United States/i,
    });
    await act(async () => {
      fireEvent.click(removeButton);
    });

    // Wait for the removal to be processed
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([]);
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
    });
  });
});
