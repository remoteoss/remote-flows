/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { TextField, TextFieldProps } from '../TextField';
import { defaultComponents } from '@/src/default-components';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('TextField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: TextFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'text',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'text' as const,
    isVisible: true,
    jsonType: 'integer',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: TextFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <TextField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockReturnValue({ components: defaultComponents });
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
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom text component when provided', () => {
    const CustomTextField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-text-field'>Custom Text Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, text: CustomTextField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomTextField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-text-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomTextField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-text-field'>Custom Text Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, text: CustomTextField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomTextField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('should pass additionalProps to custom component', () => {
    const CustomTextField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-text-field'>Custom Text Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, text: CustomTextField },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      additionalProps: { customProp: 'customValue' },
    });

    const call = CustomTextField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject({
      ...defaultProps,
      metadata: {
        customProp: 'customValue',
      },
    });
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom text component', () => {
    const CustomTextField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onChange(e);
      };

      return <input data-testid='custom-input' onChange={handleChange} />;
    });

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, text: CustomTextField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customInput = screen.getByTestId('custom-input');
    fireEvent.change(customInput, { target: { value: 'custom value' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomTextFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='context-text-field'>Context Text Field</div>
      ));
    const CustomTextFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-text-field'>Prop Text Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { ...defaultComponents, text: CustomTextFieldFromContext },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      component: CustomTextFieldProp,
    });

    expect(CustomTextFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-text-field')).toBeInTheDocument();
    expect(screen.queryByTestId('context-text-field')).not.toBeInTheDocument();
  });
});
