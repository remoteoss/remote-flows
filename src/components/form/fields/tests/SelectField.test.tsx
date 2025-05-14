/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { string } from 'yup';
import { SelectField } from '../SelectField';

type SelectFieldProps = React.ComponentProps<typeof SelectField>;

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('SelectField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: SelectFieldProps = {
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
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: SelectFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <SelectField {...props} />
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

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();

    // Open the select to see options
    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    // Now options should be visible
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles selection change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom select component when provided', () => {
    const CustomSelectField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-select-field">Custom Select Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { select: CustomSelectField },
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
      components: { select: CustomSelectField },
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
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { select: CustomSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customSelect = screen.getByTestId('custom-select');
    fireEvent.change(customSelect, { target: { value: 'option1' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomSelectFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="context-select-field">Context Select Field</div>
      ));
    const CustomSelectFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="prop-select-field">Prop Select Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { select: CustomSelectFieldFromContext },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      component: CustomSelectFieldProp,
    });

    expect(CustomSelectFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-select-field')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-select-field'),
    ).not.toBeInTheDocument();
  });
});
