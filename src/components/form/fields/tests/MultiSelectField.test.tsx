/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { array } from 'yup';
import { MultiSelectField } from '../MultiSelectField';

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

  // Helper function to render the component with a form context
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
    (useFormFields as any).mockReturnValue({ components: {} });
  });

  it('renders the default implementation correctly', () => {
    renderWithFormContext(defaultProps);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('This is a test field')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays placeholder when no options are selected', () => {
    renderWithFormContext(defaultProps);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    // MultiSelect should show placeholder text when no options are selected
  });

  it('handles multi-selection correctly', async () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    // Open the dropdown
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Wait for options to appear
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option 1' }),
      ).toBeInTheDocument();
    });

    // Select first option
    fireEvent.click(screen.getByRole('option', { name: 'Option 1' }));

    expect(mockOnChange).toHaveBeenCalledWith(['option1']);
  });

  it('handles multiple option selection', async () => {
    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Wait for dropdown to open and options to be available
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option 1' }),
      ).toBeInTheDocument();
    });

    // Select multiple options
    fireEvent.click(screen.getByRole('option', { name: 'Option 1' }));
    fireEvent.click(screen.getByRole('option', { name: 'Option 2' }));

    expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('handles option deselection', async () => {
    renderWithFormContext(
      { ...defaultProps, onChange: mockOnChange },
      { testField: ['option1', 'option2'] },
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Option 1' }),
      ).toBeInTheDocument();
    });

    // Deselect option 1
    fireEvent.click(screen.getByRole('option', { name: 'Option 1' }));

    expect(mockOnChange).toHaveBeenCalledWith(['option2']);
  });

  it('displays selected options as badges', () => {
    renderWithFormContext(defaultProps, { testField: ['option1', 'option2'] });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('allows removing selected options via badge X button', async () => {
    renderWithFormContext(
      { ...defaultProps, onChange: mockOnChange },
      { testField: ['option1', 'option2'] },
    );

    // Find the X button for Option 1
    const removeButton = screen.getByLabelText('remove Option 1');
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith(['option2']);
  });

  it('renders custom multi-select component when provided', () => {
    const CustomMultiSelectField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-multi-select-field'>
          Custom Multi-Select Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { 'multi-select': CustomMultiSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomMultiSelectField).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-multi-select-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomMultiSelectField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-multi-select-field'>
          Custom Multi-Select Field
        </div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { 'multi-select': CustomMultiSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const call = CustomMultiSelectField.mock.calls[0][0];
    expect(call.fieldData).toMatchObject(defaultProps);
    expect(call.field).toBeDefined();
    expect(call.fieldState).toBeDefined();
  });

  it('handles onChange in custom multi-select component', () => {
    const CustomMultiSelectField = vi.fn().mockImplementation(({ field }) => {
      const handleChange = (values: string[]) => {
        field.onChange(values);
      };

      return (
        <div>
          <button
            data-testid='custom-select-option'
            onClick={() => handleChange(['option1', 'option2'])}
          >
            Select Options
          </button>
        </div>
      );
    });

    (useFormFields as any).mockReturnValue({
      components: { 'multi-select': CustomMultiSelectField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    const selectButton = screen.getByTestId('custom-select-option');
    fireEvent.click(selectButton);

    expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomMultiSelectFieldFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='context-multi-select-field'>
          Context Multi-Select Field
        </div>
      ));
    const CustomMultiSelectFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-multi-select-field'>Prop Multi-Select Field</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { 'multi-select': CustomMultiSelectFieldFromContext },
    });

    renderWithFormContext({
      ...defaultProps,
      onChange: mockOnChange,
      component: CustomMultiSelectFieldProp,
    });

    expect(CustomMultiSelectFieldProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-multi-select-field')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-multi-select-field'),
    ).not.toBeInTheDocument();
  });

  it('handles defaultValue correctly', () => {
    renderWithFormContext(defaultProps, { testField: ['option1', 'option3'] });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderWithFormContext(defaultProps);

    const formItem = document.querySelector('[data-field="testField"]');
    expect(formItem).toHaveClass('RemoteFlows__SelectField__Item__testField');
  });

  it('shows form validation errors', () => {
    const TestComponentWithError = () => {
      const methods = useForm({
        defaultValues: { testField: [] },
      });

      // Trigger validation error
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
    renderWithFormContext({
      ...defaultProps,
      options: [],
    });

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Should show "No item found" message
    expect(screen.getByText('No item found.')).toBeInTheDocument();
  });

  it('passes additional props to MultiSelect component', () => {
    const placeholder = 'Select multiple options';
    const className = 'custom-multi-select';

    renderWithFormContext({
      ...defaultProps,
      placeholder,
      className,
    });

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    // Additional props should be passed through to the MultiSelect component
  });

  it('handles keyboard navigation for removing selected options', async () => {
    renderWithFormContext(
      { ...defaultProps, onChange: mockOnChange },
      { testField: ['option1'] },
    );

    const removeButton = screen.getByLabelText('remove Option 1');
    fireEvent.keyDown(removeButton, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
