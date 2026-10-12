import { useFormFields } from '@/src/context';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { string } from 'yup';
import { addBusinessDays } from 'date-fns';
import { DatePickerField, DatePickerFieldProps } from '../DatePickerField';
import { DatePickerFieldDefault } from '@/src/components/form/fields/default/DatePickerFieldDefault';
import { $TSFixMe } from '@/src/types/remoteFlows';

// Mock dependencies
vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(),
  };
});

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    addBusinessDays: vi.fn(),
  };
});

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
  const renderWithFormContext = (
    props: DatePickerFieldProps,
    defaultValues?: Record<string, unknown>,
  ) => {
    const TestComponent = () => {
      const methods = useForm({ defaultValues });
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
    (useFormFields as $TSFixMe).mockReturnValue({
      components: {
        date: DatePickerFieldDefault,
      },
    });
    (addBusinessDays as $TSFixMe).mockClear();
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

  it('does not offer to clear a required date', () => {
    renderWithFormContext(defaultProps);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('15'));

    expect(screen.queryByLabelText('Clear Test Field')).not.toBeInTheDocument();
  });

  it('clears an optional date back to empty', () => {
    renderWithFormContext({ ...defaultProps, required: false });

    expect(screen.queryByLabelText('Clear Test Field')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('date-picker-button-testField'));
    fireEvent.click(screen.getByText('15'));
    expect(
      screen.getByTestId('date-picker-button-testField'),
    ).toHaveTextContent('15');

    fireEvent.click(screen.getByLabelText('Clear Test Field'));

    expect(
      screen.getByTestId('date-picker-button-testField'),
    ).not.toHaveTextContent('15');
    expect(screen.queryByLabelText('Clear Test Field')).not.toBeInTheDocument();
  });

  it('clears an optional date that was prefilled from saved values', () => {
    renderWithFormContext(
      { ...defaultProps, required: false },
      { testField: '2024-03-15' },
    );

    expect(
      screen.getByTestId('date-picker-button-testField'),
    ).toHaveTextContent('2024-03-15');

    fireEvent.click(screen.getByLabelText('Clear Test Field'));

    expect(
      screen.getByTestId('date-picker-button-testField'),
    ).not.toHaveTextContent('2024-03-15');
  });

  it('renders custom date picker component when provided', () => {
    const CustomDatePickerField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-date-picker-field'>
          Custom Date Picker Field
        </div>
      ));

    (useFormFields as $TSFixMe).mockReturnValue({
      components: { date: CustomDatePickerField },
    });

    renderWithFormContext({ ...defaultProps, onChange: mockOnChange });

    expect(CustomDatePickerField).toHaveBeenCalled();
    expect(screen.getByTestId('custom-date-picker-field')).toBeInTheDocument();
  });

  it('passes field props to custom component correctly', () => {
    const CustomDatePickerField = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='custom-date-picker-field'>
          Custom Date Picker Field
        </div>
      ));

    (useFormFields as $TSFixMe).mockReturnValue({
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
          type='date'
          data-testid='custom-date-picker'
          onChange={(e) => handleChange(new Date(e.target.value))}
        />
      );
    });

    (useFormFields as $TSFixMe).mockReturnValue({
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
        <div data-testid='context-date-picker-field'>
          Context Date Picker Field
        </div>
      ));
    const CustomDatePickerFieldProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid='prop-date-picker-field'>Prop Date Picker Field</div>
      ));

    (useFormFields as $TSFixMe).mockReturnValue({
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

  it('calculates minDateValue using addBusinessDays when rest.meta.mot is provided', () => {
    const propsWithMot = {
      ...defaultProps,
      meta: { mot: 20 },
    };

    renderWithFormContext(propsWithMot);

    // Verify addBusinessDays was called with a date and mot value
    expect(addBusinessDays).toHaveBeenCalledWith(expect.any(Date), 21);

    // Verify the component renders without errors
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  it('falls back to minDate when rest.meta.mot is not a number', () => {
    const propsWithMinDate = {
      ...defaultProps,
      minDate: '2024-01-10',
      meta: { mot: 'invalid' },
    };

    renderWithFormContext(propsWithMinDate);

    // Verify addBusinessDays was not called
    expect(addBusinessDays).not.toHaveBeenCalled();

    // Verify the component renders without errors
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  it('handles undefined meta.mot gracefully', () => {
    const propsWithoutMot = {
      ...defaultProps,
      minDate: '2024-01-10',
      meta: {},
    };

    renderWithFormContext(propsWithoutMot);

    // Verify addBusinessDays was not called
    expect(addBusinessDays).not.toHaveBeenCalled();

    // The component should still render correctly
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  describe('DatePickerField - maxDate functionality', () => {
    it('passes maxDate to custom date picker component', () => {
      const maxDate = '2024-12-31';
      const CustomDatePickerField = vi
        .fn()
        .mockImplementation(() => (
          <div data-testid='custom-date-picker-field'>Custom Date Picker</div>
        ));

      (useFormFields as $TSFixMe).mockReturnValue({
        components: { date: CustomDatePickerField },
      });

      renderWithFormContext({
        ...defaultProps,
        maxDate,
      });

      expect(CustomDatePickerField).toHaveBeenCalled();
      const call = CustomDatePickerField.mock.calls[0][0];

      // Verify maxDate is passed as ISO string
      expect(call.fieldData.maxDate).toBe(
        new Date('2024-12-31T23:59:59').toISOString(),
      );
    });

    it('handles both minDate and maxDate together', () => {
      const minDate = '2024-01-01';
      const maxDate = '2024-12-31';
      const CustomDatePickerField = vi
        .fn()
        .mockImplementation(() => (
          <div data-testid='custom-date-picker-field'>Custom Date Picker</div>
        ));

      (useFormFields as $TSFixMe).mockReturnValue({
        components: { date: CustomDatePickerField },
      });

      renderWithFormContext({
        ...defaultProps,
        minDate,
        maxDate,
      });

      const call = CustomDatePickerField.mock.calls[0][0];

      expect(call.fieldData.minDate).toBe(
        new Date('2024-01-01T00:00:00').toISOString(),
      );
      expect(call.fieldData.maxDate).toBe(
        new Date('2024-12-31T23:59:59').toISOString(),
      );
    });
  });
});
