/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { TextAreaField, TextAreaFieldProps } from '../TextAreaField';
import { TextAreaFieldDefault } from '@/src/components/form/fields/default/TextAreaFieldDefault';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('TextAreaField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: TextAreaFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'textarea',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'textarea' as const,
    isVisible: true,
    jsonType: 'string',
    required: true,
    schema: string(),
    scopedJsonSchema: {},
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: TextAreaFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <TextAreaField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockReturnValue({
      components: {
        textarea: TextAreaFieldDefault,
      },
    });
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
  });

  it('handles textarea change correctly', () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new value' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders custom textarea component when provided', () => {
    const CustomTextAreaField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-textarea-field'>Custom TextArea Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { textarea: CustomTextAreaField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomTextAreaField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-textarea-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomTextAreaField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-textarea-field'>Custom TextArea Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { textarea: CustomTextAreaField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomTextAreaField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom textarea component', () => {
    const CustomTextAreaField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        field.onChange(e);
      };

      return <textarea data-testid='custom-textarea' onChange={handleChange} />;
    });

    (useFormFields as any).mockReturnValue({
      components: { textarea: CustomTextAreaField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const customTextarea = screen.getByTestId('custom-textarea');
    fireEvent.change(customTextarea, { target: { value: 'custom value' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomTextAreaFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='context-textarea-field'>Context TextArea Field</div>
      ));
    const CustomTextAreaFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-textarea-field'>Prop TextArea Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { textarea: CustomTextAreaFieldFromContext },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      component: CustomTextAreaFieldProp,
    });

    expect(CustomTextAreaFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-textarea-field')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-textarea-field'),
    ).not.toBeInTheDocument();
  });
});
