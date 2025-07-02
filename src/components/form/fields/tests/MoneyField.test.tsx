/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { number } from 'yup';
import { MoneyField } from '../MoneyField';
import { TextFieldProps } from '../TextField';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('MoneyField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: TextFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'money',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'number' as const,
    isVisible: true,
    jsonType: 'number',
    required: true,
    schema: number(),
    scopedJsonSchema: {},
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: TextFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <MoneyField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockReturnValue({ components: {} });
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  it('handles input change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const input = screen.getByPlaceholderText('Test Field');
    fireEvent.change(input, { target: { value: '123.45' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom money component when provided', () => {
    const CustomMoneyField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-money-field">Custom Money Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { money: CustomMoneyField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomMoneyField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-money-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomMoneyField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-money-field">Custom Money Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { money: CustomMoneyField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomMoneyField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom money component', () => {
    const CustomMoneyField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e);
      };

      return <input data-testid="custom-input" onChange={handleChange} />;
    });

    (useFormFields as any).mockReturnValue({
      components: { money: CustomMoneyField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customInput = screen.getByTestId('custom-input');
    fireEvent.change(customInput, { target: { value: '456.78' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
