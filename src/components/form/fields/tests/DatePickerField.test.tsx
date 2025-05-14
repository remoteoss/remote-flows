/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { string } from 'yup';
import { DatePickerField, DatePickerFieldProps } from '../DatePickerField';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('DatePickerField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: DatePickerFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'date',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'date' as const,
    isVisible: true,
    jsonType: 'string',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: DatePickerFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <DatePickerField {...props} />
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
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  it('handles date selection correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assuming the calendar is now visible, we can select a date
    const dateCell = screen.getByText('15');
    fireEvent.click(dateCell);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom date picker component when provided', () => {
    const CustomDatePickerField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-date-picker-field">
          Custom Date Picker Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { date: CustomDatePickerField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomDatePickerField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-date-picker-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomDatePickerField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-date-picker-field">
          Custom Date Picker Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { date: CustomDatePickerField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomDatePickerField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom date picker component', () => {
    const CustomDatePickerField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (date: Date) => {
        field.onChange(date);
      };

      return (
        <input
          type="date"
          data-testid="custom-date-picker"
          onChange={(e) => handleChange(new Date(e.target.value))}
        />
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { date: CustomDatePickerField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customDatePicker = screen.getByTestId('custom-date-picker');
    fireEvent.change(customDatePicker, { target: { value: '2024-01-15' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomDatePickerFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="context-date-picker-field">
          Context Date Picker Field
        </div>
      ));
    const CustomDatePickerFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="prop-date-picker-field">Prop Date Picker Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { date: CustomDatePickerFieldFromContext },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      component: CustomDatePickerFieldProp,
    });

    expect(CustomDatePickerFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-date-picker-field')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-date-picker-field'),
    ).not.toBeInTheDocument();
  });
});
