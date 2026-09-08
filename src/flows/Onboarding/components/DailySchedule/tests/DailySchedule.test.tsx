import { render, screen, waitFor, within } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { DailyScheduleContainer } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleContainer';
import { DailySchedule } from '@/src/flows/Onboarding/components/DailySchedule/DailySchedule';
import {
  DailyScheduleContainerProps,
  DailyScheduleRenderProps,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import { germanyDailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/tests/fixtures';
import { TestProviders } from '@/src/tests/testHelpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

/**
 * Renders `daily_schedule` the exact way `jsfModify` (Phase 4) will: a JSF
 * field carrying `metadata` + a `Component` override, resolved through the
 * shared `JSONSchemaFormFields` renderer — mirroring
 * JSONSchemaFormCustomComponent.test.tsx's pattern for `JSFCustomComponentProps`
 * fields, verified against the real Germany schema's metadata shape (PAY-2868
 * Phase 3). See plans/daily-schedule-field.md.
 */
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

describe('DailySchedule', () => {
  it('summarizes the default schedule when no value is set yet', () => {
    renderWithForm([createDailyScheduleField()], { daily_schedule: undefined });

    expect(
      screen.getByText('Monday: 09:00 - 18:00 (60min break)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Friday: 09:00 - 18:00 (60min break)'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Saturday:/)).not.toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('summarizes an already-saved schedule', () => {
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
      screen.getByText('Monday: 08:00 - 16:00 (30min break)'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Wednesday:/)).not.toBeInTheDocument();
  });

  it('writes the whole schedule back in a single setValue call on save', async () => {
    const user = userEvent.setup();
    const { getFormValues } = renderWithForm([createDailyScheduleField()], {
      daily_schedule: undefined,
    });

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Friday' }));
    await user.click(
      within(dialog).getByRole('button', { name: 'Save schedule' }),
    );

    await waitFor(() => {
      const value = getFormValues().daily_schedule as {
        selected_days: string[];
        schedule: Record<string, unknown>;
      };
      expect(value.selected_days).toEqual([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
      ]);
      expect(value.schedule.friday).toBeUndefined();
      expect(value.schedule.monday).toEqual({
        start_time: '09:00',
        end_time: '18:00',
        break_duration_minutes: 60,
      });
    });
  });

  it('requires at least one selected day', async () => {
    const user = userEvent.setup();
    renderWithForm([createDailyScheduleField()], {
      daily_schedule: undefined,
    });

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    const dialog = screen.getByRole('dialog');
    for (const day of [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]) {
      await user.click(within(dialog).getByRole('checkbox', { name: day }));
    }

    await user.click(
      within(dialog).getByRole('button', { name: 'Save schedule' }),
    );

    expect(
      await within(dialog).findByText('Select at least one work day'),
    ).toBeInTheDocument();
  });

  it('pre-populates the edit modal from an already-saved schedule', async () => {
    const user = userEvent.setup();
    renderWithForm([createDailyScheduleField()], {
      daily_schedule: {
        selected_days: ['monday'],
        schedule: {
          monday: {
            start_time: '10:00',
            end_time: '14:00',
            break_duration_minutes: 15,
          },
        },
      },
    });

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('checkbox', { name: 'Monday' }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
    ).not.toBeChecked();
    expect(within(dialog).getByDisplayValue('10:00')).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue('14:00')).toBeInTheDocument();
  });

  it('displays field validation errors when invalid time format is entered', async () => {
    const user = userEvent.setup();
    renderWithForm([createDailyScheduleField()], {
      daily_schedule: undefined,
    });

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    const dialog = screen.getByRole('dialog');
    const startTimeInput = within(dialog).getAllByDisplayValue('09:00')[0];
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '9:00');

    await user.click(
      within(dialog).getByRole('button', { name: 'Save schedule' }),
    );

    expect(
      await within(dialog).findByText(/Please check the form for errors/),
    ).toBeInTheDocument();
  });
});
