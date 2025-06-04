/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkScheduleField } from '../WorkScheduleField';
import { DailySchedule } from '../workScheduleUtils';
import { JSFField } from '@/src/types/remoteFlows';
import { Components } from '@/src/types/remoteFlows';
import * as yup from 'yup';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

type WorkScheduleFieldProps = JSFField & {
  name: string;
  default: DailySchedule[];
  onChange?: (value: any) => void;
  component?: Components['work-schedule'];
};

describe('WorkScheduleField Component', () => {
  const defaultSchedule: DailySchedule[] = [
    {
      day: 'Monday',
      checked: true,
      start_time: '09:00',
      end_time: '17:00',
      hours: 8,
      break_duration_minutes: '60',
    },
    {
      day: 'Tuesday',
      checked: true,
      start_time: '09:00',
      end_time: '17:00',
      hours: 8,
      break_duration_minutes: '60',
    },
  ];

  const fieldSchema = yup.object({
    day: yup.string().required(),
    checked: yup.boolean().required(),
    start_time: yup
      .string()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
      .when('checked', {
        is: true,
        then: (schema) => schema.required('Required'),
        otherwise: (schema) => schema.optional().nullable(),
      }),
    end_time: yup
      .string()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
      .when('checked', {
        is: true,
        then: (schema) => schema.required('Required'),
        otherwise: (schema) => schema.optional().nullable(),
      }),
    hours: yup.number().default(0),
    break_duration_minutes: yup.string().default('0'),
  });

  const defaultProps: WorkScheduleFieldProps = {
    name: 'workSchedule',
    default: defaultSchedule,
    computedAttributes: {},
    errorMessage: {},
    isVisible: true,
    jsonType: 'array',
    required: true,
    schema: yup.array().of(fieldSchema),
    scopedJsonSchema: {},
    description: '',
    inputType: 'work-schedule',
    label: 'Work Schedule',
    type: 'array',
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: WorkScheduleFieldProps) => {
    const TestComponent = () => {
      const methods = useForm({
        defaultValues: {
          [props.name]: props.default,
        },
      });
      return (
        <FormProvider {...methods}>
          <WorkScheduleField {...props} />
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

    expect(screen.getByText('Work hours')).toBeInTheDocument();
    expect(screen.getByText('Edit Schedule')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element?.textContent === 'Total of 16 hours per week',
      ),
    ).toBeInTheDocument();
  });

  it('opens schedule editor dialog when clicking edit button with default values', async () => {
    renderWithFormContext(defaultProps);

    const editButton = screen.getByText('Edit Schedule');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(
        screen.getByText('Edit employee working hours'),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Mon' })).toBeChecked();
    });
    expect(screen.getByRole('checkbox', { name: 'Tue' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Wed' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Thu' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Fri' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sat' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sun' })).not.toBeChecked();
  });

  it('validates time format in schedule editor', async () => {
    renderWithFormContext(defaultProps);

    // Open dialog
    fireEvent.click(screen.getByText('Edit Schedule'));

    // Wait for dialog to open
    await waitFor(() => {
      expect(
        screen.getByText('Edit employee working hours'),
      ).toBeInTheDocument();
    });

    // Find Monday's start time input
    const startTimeInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(startTimeInput, { target: { value: 'invalid-time' } });

    // Try to save
    fireEvent.click(screen.getByText('Save Schedule'));

    // Should show validation error
    await waitFor(() => {
      expect(
        screen.getByText('Invalid time format (HH:mm)'),
      ).toBeInTheDocument();
    });
  });

  it('calculates hours correctly when editing schedule', async () => {
    renderWithFormContext(defaultProps);

    // Open dialog
    fireEvent.click(screen.getByText('Edit Schedule'));

    // Wait for dialog to open and be fully rendered
    await waitFor(() => {
      expect(
        screen.getByText('Edit employee working hours'),
      ).toBeInTheDocument();
    });

    // Find Monday's start and end time inputs
    const inputs = screen.getAllByRole('textbox');
    const startTimeInput = inputs[0];
    const endTimeInput = inputs[1];

    // Change times and wait for form to update
    fireEvent.change(startTimeInput, { target: { value: '08:00' } });
    await waitFor(() => {
      expect(startTimeInput).toHaveValue('08:00');
    });

    fireEvent.change(endTimeInput, { target: { value: '16:00' } });
    await waitFor(() => {
      expect(endTimeInput).toHaveValue('16:00');
    });

    // Save changes
    fireEvent.click(screen.getByText('Save Schedule'));

    // Check if total hours are updated
    await waitFor(() => {
      expect(
        screen.getByText(
          (_, element) => element?.textContent === 'Total of 16 hours per week',
        ),
      ).toBeInTheDocument();
    });
  });

  it('renders custom work schedule component when provided', () => {
    const CustomWorkSchedule = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="custom-work-schedule">Custom Work Schedule</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { 'work-schedule': CustomWorkSchedule },
    });

    renderWithFormContext(defaultProps);

    // In React 18's strict mode, components are mounted twice
    expect(CustomWorkSchedule).toHaveBeenCalled();
    expect(screen.getByTestId('custom-work-schedule')).toBeInTheDocument();
  });

  it('component prop takes precedence over useFormFields().components', () => {
    const CustomWorkScheduleFromContext = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="context-work-schedule">Context Work Schedule</div>
      ));
    const CustomWorkScheduleProp = vi
      .fn()
      .mockImplementation(() => (
        <div data-testid="prop-work-schedule">Prop Work Schedule</div>
      ));

    (useFormFields as any).mockReturnValue({
      components: { 'work-schedule': CustomWorkScheduleFromContext },
    });

    renderWithFormContext({
      ...defaultProps,
      component: CustomWorkScheduleProp,
    });

    expect(CustomWorkScheduleProp).toHaveBeenCalled();
    expect(screen.getByTestId('prop-work-schedule')).toBeInTheDocument();
    expect(
      screen.queryByTestId('context-work-schedule'),
    ).not.toBeInTheDocument();
  });

  it('handles unchecking a day correctly', async () => {
    renderWithFormContext(defaultProps);

    // Open dialog
    fireEvent.click(screen.getByText('Edit Schedule'));

    // Wait for dialog to open and be fully rendered
    await waitFor(() => {
      expect(
        screen.getByText('Edit employee working hours'),
      ).toBeInTheDocument();
    });

    // Find Monday's checkbox by its name attribute
    const mondayCheckbox = screen.getByRole('checkbox', { name: /mon/i });

    await act(async () => {
      fireEvent.click(mondayCheckbox);
    });

    // Save changes
    fireEvent.click(screen.getByText('Save Schedule'));

    // Check if total hours are updated
    await waitFor(() => {
      expect(
        screen.getByText(
          (_, element) => element?.textContent === 'Total of 7 hours per week',
        ),
      ).toBeInTheDocument();
    });
  });
});
