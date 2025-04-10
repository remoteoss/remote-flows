/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { number } from 'yup';
import { NumberField } from '../NumberField';
import { TextFieldProps } from '../TextField';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('NumberField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: TextFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'integer',
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
          <NumberField {...props} />
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
    fireEvent.change(input, { target: { value: '123' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom number component when provided', () => {
    const CustomNumberField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-number-field">Custom Number Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { number: CustomNumberField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomNumberField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-number-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomNumberField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-number-field">Custom Number Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { number: CustomNumberField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomNumberField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom number component', () => {
    const CustomNumberField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e);
      };

      return <input data-testid="custom-input" onChange={handleChange} />;
    });

    (useFormFields as any).mockReturnValue({
      components: { number: CustomNumberField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customInput = screen.getByTestId('custom-input');
    fireEvent.change(customInput, { target: { value: '456' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
