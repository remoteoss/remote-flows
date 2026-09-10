import { $TSFixMe } from '@/scripts/types';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { DailySchedule } from '@/src/flows/Onboarding/components/DailySchedule/DailySchedule';
import { DailyScheduleContainer } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleContainer';
import { germanyDailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/tests/fixtures';
import {
  DailyScheduleContainerProps,
  DailyScheduleRenderProps,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import { TestProviders } from '@/src/tests/testHelpers';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

const DailyScheduleField = (
  props: Omit<DailyScheduleContainerProps, 'render'>,
) => (
  <DailyScheduleContainer
    {...(props as $TSFixMe as DailyScheduleContainerProps)}
    render={(renderProps: DailyScheduleRenderProps) => (
      <DailySchedule {...renderProps} />
    )}
  />
);

const createDailyScheduleField = (overrides: Record<string, unknown> = {}) => ({
  name: 'daily_schedule',
  label: 'Daily schedule',
  Component: DailyScheduleField,
  metadata: germanyDailyScheduleMetadata,
  ...overrides,
});

const renderWithForm = (
  fields: Array<Record<string, unknown>>,
  defaultValues: Record<string, unknown> = {},
) => {
  let formValues: Record<string, unknown> = {};

  const TestComponent = () => {
    const methods = useForm({ defaultValues });
    formValues = methods.watch();

    return (
      <TestProviders>
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
        </FormProvider>
      </TestProviders>
    );
  };

  const utils = render(<TestComponent />);
  return { ...utils, getFormValues: () => formValues };
};

/** Matches an element whose own full text (across bold/plain child spans) equals `text`. */
const byOwnText = (text: string) => (_: string, element: Element | null) =>
  element?.textContent === text;

describe('DailySchedule', () => {
  it('renders the "Daily schedule" header with the customized-hours badge', () => {
    renderWithForm([createDailyScheduleField()], { daily_schedule: undefined });

    expect(screen.getByText('Daily schedule')).toBeInTheDocument();
    expect(
      screen.getByText("customized hours (employee's timezone)"),
    ).toBeInTheDocument();
  });

  it('summarizes the default schedule when no value is set yet, grouping consecutive days', () => {
    renderWithForm([createDailyScheduleField()], { daily_schedule: undefined });

    expect(
      screen.getByText(byOwnText('Monday to Friday, from 09h00 to 18h00')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(byOwnText('With 1h daily breaks')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(byOwnText('Total of 40 hours per week')),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Saturday/)).not.toBeInTheDocument();
  });

  it('summarizes an already-saved schedule, grouping consecutive days', () => {
    renderWithForm([createDailyScheduleField()], {
      daily_schedule: {
        selected_days: ['monday', 'tuesday'],
        schedule: {
          monday: {
            start_time: '08:00',
            end_time: '16:00',
            break_duration_minutes: 30,
          },
          tuesday: {
            start_time: '08:00',
            end_time: '16:00',
            break_duration_minutes: 30,
          },
        },
      },
    });

    expect(
      screen.getByText(byOwnText('Monday to Tuesday, from 08h00 to 16h00')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(byOwnText('With 30m daily breaks')),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Wednesday/)).not.toBeInTheDocument();
  });

  it('shows the weekly hours-range error outside the modal when the saved schedule is too short', () => {
    renderWithForm([createDailyScheduleField()], {
      work_schedule: 'full_time',
      daily_schedule: {
        selected_days: ['monday'],
        schedule: {
          monday: {
            start_time: '09:00',
            end_time: '13:00',
            break_duration_minutes: 0,
          },
        },
      },
    });

    expect(
      screen.getByText('Work hours outside of weekly range'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The work week for a full-time employee in Germany is between 31 and 48 hours\./,
      ),
    ).toBeInTheDocument();
  });

  it('does not show the weekly hours-range error when the saved schedule is within range', () => {
    renderWithForm([createDailyScheduleField()], { daily_schedule: undefined });

    expect(
      screen.queryByText('Work hours outside of weekly range'),
    ).not.toBeInTheDocument();
  });
});
