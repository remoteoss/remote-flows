/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { RadioGroupField } from '../RadioGroupField';
import { JSFField } from '@/src/types/remoteFlows';
import { RadioGroupFieldDefault } from '@/src/components/form/fields/default/RadioGroupFieldDefault';

type RadioGroupFieldProps = JSFField & {
  onChange?: (value: string | React.ChangeEvent<HTMLInputElement>) => void;
  options: {
    value: string;
    label: string;
    disabled?: boolean;
    description?: string;
  }[];
  component?: any;
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
    (useFormFields as any).mockReturnValue({
      components: {
        radio: RadioGroupFieldDefault,
      },
    });
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
        <div data-testid='custom-radio-field'>Custom Radio Field</div>
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
        <div data-testid='custom-radio-field'>Custom Radio Field</div>
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
            type='radio'
            data-testid='custom-radio-input'
            onChange={() => handleChange('option1')}
          />
          <input
            type='radio'
            data-testid='custom-radio-input-2'
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

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomRadioGroupFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='context-radio-field'>Context Radio Field</div>
      ));
    const CustomRadioGroupFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-radio-field'>Prop Radio Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { radio: CustomRadioGroupFieldFromContext },
    });

    renderWithFormContext({
      ...(defaultProps as any),
      onChange: mockOnChange,
      component: CustomRadioGroupFieldProp,
    });

    expect(CustomRadioGroupFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-radio-field')).toBeInTheDocument();
    expect(screen.queryByTestId('context-radio-field')).not.toBeInTheDocument();
  });

  it('disables radio buttons when option.disabled is true', () => {
    const propsWithDisabledOption: RadioGroupFieldProps = {
      ...defaultProps,
      options: [
        { value: 'option1', label: 'Option 1', disabled: true },
        { value: 'option2', label: 'Option 2', disabled: false },
        { value: 'option3', label: 'Option 3' }, // no disabled property
      ],
    };

    renderWithFormContext(propsWithDisabledOption);

    const option1Radio = screen.getByLabelText('Option 1');
    const option2Radio = screen.getByLabelText('Option 2');
    const option3Radio = screen.getByLabelText('Option 3');

    expect(option1Radio).toBeDisabled();
    expect(option2Radio).not.toBeDisabled();
    expect(option3Radio).not.toBeDisabled();
  });

  it('prevents disabled radio buttons from being selected', () => {
    const propsWithDisabledOption: RadioGroupFieldProps = {
      ...defaultProps,
      onChange: mockOnChange,
      options: [
        { value: 'option1', label: 'Option 1', disabled: true },
        { value: 'option2', label: 'Option 2' },
      ],
    };

    renderWithFormContext(propsWithDisabledOption);

    const disabledRadio = screen.getByLabelText('Option 1');
    const enabledRadio = screen.getByLabelText('Option 2');

    // Try to click disabled radio button
    fireEvent.click(disabledRadio);
    expect(mockOnChange).not.toHaveBeenCalled();

    // Click enabled radio button
    fireEvent.click(enabledRadio);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
