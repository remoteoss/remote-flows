/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { string } from 'yup';
import { RadioGroupField } from '../RadioGroupField';
import { JSFField } from '@/src/types/remoteFlows';

type RadioGroupFieldProps = JSFField & {
  onChange?: (value: string | React.ChangeEvent<HTMLInputElement>) => void;
  options: { value: string; label: string }[];
};

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('RadioGroupField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: RadioGroupFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'string',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'radio' as const,
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
  const renderWithFormContext = (props: RadioGroupFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <RadioGroupField {...props} />
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
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles radio selection change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const radioOption = screen.getByLabelText('Option 1');
    fireEvent.click(radioOption);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom radio component when provided', () => {
    const CustomRadioGroupField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-radio-field">Custom Radio Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { radio: CustomRadioGroupField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomRadioGroupField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-radio-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomRadioGroupField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-radio-field">Custom Radio Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { radio: CustomRadioGroupField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomRadioGroupField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom radio component', () => {
    const CustomRadioGroupField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (value: string) => {
        field.onChange(value);
      };

      return (
        <div>
          <input
            type="radio"
            data-testid="custom-radio-input"
            onChange={() => handleChange('option1')}
          />
          <input
            type="radio"
            data-testid="custom-radio-input-2"
            onChange={() => handleChange('option2')}
          />
        </div>
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { radio: CustomRadioGroupField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customRadioInput = screen.getByTestId('custom-radio-input');
    fireEvent.click(customRadioInput);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
