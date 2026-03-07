/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { array } from 'yup';
import { MultiSelectField } from '../MultiSelectField';
import { defaultComponents } from '@/src/tests/defaultComponents';

type MultiSelectFieldProps = React.ComponentProps<typeof MultiSelectField>;

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

describe('MultiSelectField Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps: MultiSelectFieldProps = {
    name: 'testField',
    label: 'Test Field',
    description: 'This is a test field',
    type: 'array',
    computedAttributes: {},
    errorMessage: {
      required: 'This field is required',
    },
    inputType: 'multi-select' as const,
    isVisible: true,
    jsonType: 'array',
    required: true,
    schema: array(),
    scopedJsonSchema: {},
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  };

  const renderWithFormContext = (
    props: MultiSelectFieldProps,
    defaultValues?: any,
  ) => {
    const TestComponent = () => {
      const methods = useForm({
        defaultValues: defaultValues || { [props.name]: [] },
      });
      return (
        <FormProvider {...methods}>
          <MultiSelectField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as any).mockReturnValue({
      components: {
        'multi-select': defaultComponents['multi-select'],
      },
    });
  });

  it('renders the multi-select correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles single and multiple option selection', async () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option 1' }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: 'Option 1' }));
    expect(mockOnChange).toHaveBeenCalledWith(['option1']);

    fireEvent.click(screen.getByRole('option', { name: 'Option 2' }));
    expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('handles option deselection via dropdown', async () => {
    renderWithFormContext(
      { ...defaultProps, onChange: mockOnChange },
      { testField: ['option1', 'option2'] },
    );

    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option 1' }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: 'Option 1' }));
    expect(mockOnChange).toHaveBeenCalledWith(['option2']);
  });

  it('displays pre-selected options as badges', () => {
    renderWithFormContext(defaultProps, { testField: ['option1', 'option2'] });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('allows removing selected options via badge button and keyboard', async () => {
    renderWithFormContext(
      { ...defaultProps, onChange: mockOnChange },
      { testField: ['option1', 'option2'] },
    );

    fireEvent.click(screen.getByLabelText('remove Option 1'));
    expect(mockOnChange).toHaveBeenCalledWith(['option2']);

    fireEvent.keyDown(screen.getByLabelText('remove Option 2'), {
      key: 'Enter',
    });
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('shows form validation errors', () => {
    const TestComponentWithError = () => {
      const methods = useForm({ defaultValues: { testField: [] } });
      methods.setError('testField', {
        type: 'required',
        message: 'This field is required',
      });
      return (
        <FormProvider {...methods}>
          <MultiSelectField {...defaultProps} />
        </FormProvider>
      );
    };

    render(<TestComponentWithError />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles empty options array', () => {
    renderWithFormContext({ ...defaultProps, options: [] });

    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('No item found.')).toBeInTheDocument();
  });
});
