/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { boolean } from 'yup';
import { CheckBoxField, CheckBoxFieldProps } from '../CheckBoxField';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('CheckBoxField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: CheckBoxFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'boolean',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'checkbox' as const,
    isVisible: true,
    jsonType: 'boolean',
    required: true,
    schema: boolean(),
    scopedJsonSchema: {},
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: CheckBoxFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <CheckBoxField {...props} />
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
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  it('handles checkbox change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom checkbox component when provided', () => {
    const CustomCheckboxField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-checkbox-field">Custom Checkbox Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { checkbox: CustomCheckboxField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomCheckboxField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-checkbox-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomCheckboxField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-checkbox-field">Custom Checkbox Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { checkbox: CustomCheckboxField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomCheckboxField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom checkbox component', () => {
    const CustomCheckboxField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e);
      };

      return (
        <input
          type="checkbox"
          data-testid="custom-checkbox"
          onChange={handleChange}
        />
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { checkbox: CustomCheckboxField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customCheckbox = screen.getByTestId('custom-checkbox');
    fireEvent.click(customCheckbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
