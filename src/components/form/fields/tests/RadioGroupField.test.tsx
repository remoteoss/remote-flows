/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { RadioGroupField } from '../RadioGroupField';
import { JSFField } from '@/src/types/remoteFlows';
import { defaultComponents } from '@/src/tests/defaultComponents';

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
        radio: defaultComponents.radio,
      },
    });
  });

  it('renders the radio correctly', () => {
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

  it('marks options as disabled based on the disabled prop', () => {
    renderWithFormContext({
      ...defaultProps,
      options: [
        { value: 'option1', label: 'Option 1', disabled: true },
        { value: 'option2', label: 'Option 2', disabled: false },
        { value: 'option3', label: 'Option 3' },
      ],
    });

    expect(screen.getByLabelText('Option 1')).toBeDisabled();
    expect(screen.getByLabelText('Option 2')).not.toBeDisabled();
    expect(screen.getByLabelText('Option 3')).not.toBeDisabled();
  });
});
