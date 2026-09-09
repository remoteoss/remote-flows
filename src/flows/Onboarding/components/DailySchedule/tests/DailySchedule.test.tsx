import { render, screen, waitFor, within } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
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

/**
 * Renders `daily_schedule` the way it actually appears in production: Tiger
 * groups it into a UI-only `x-jsf-fieldsets` section alongside sibling
 * fields, which `getFieldsWithFlatFieldsets` turns into a flat
 * `FieldSetField` wrapping it — a different render path than
 * `JSONSchemaFormFields`'s direct `field.Component` branch above. A
 * `Component`-overridden field whose own `type` is `fieldset` (true for
 * `daily_schedule`, since its schema is a nested object) hits
 * `FieldSetField`'s nested-fieldset branch before its `field.Component`
 * branch, recursing into a second `FieldSetField` layer — regression
 * coverage for that layer dropping `value`/`setValue`.
 */
const renderNestedInFieldSet = (
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
          <FieldSetField
            name='work_schedule_section'
            label='Work schedule'
            description=''
            fields={fields as $TSFixMe}
            components={{}}
            isFlatFieldset
            variant='outset'
          />
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

  it('hides the "Reset to default" button when the schedule already matches the default', async () => {
    const user = userEvent.setup();
    renderWithForm([createDailyScheduleField()], {
      daily_schedule: undefined,
    });

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).queryByRole('button', { name: 'Reset to default' }),
    ).not.toBeInTheDocument();
  });

  it('shows the "Reset to default" button once the schedule deviates from the default, and resets on click', async () => {
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
    // Already deviates from the default (Monday-Friday) on open, since only
    // Monday is saved — matches Dragon's "dirty on build" behavior.
    expect(
      within(dialog).getByRole('button', { name: 'Reset to default' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Monday' }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
    ).not.toBeChecked();

    await user.click(
      within(dialog).getByRole('button', { name: 'Reset to default' }),
    );

    // Default schedule (from germanyDailyScheduleMetadata) is Monday-Friday,
    // 09:00-18:00 — discarding the saved value (Monday only, 10:00-14:00).
    expect(
      within(dialog).getByRole('checkbox', { name: 'Monday' }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Friday' }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Saturday' }),
    ).not.toBeChecked();
    expect(within(dialog).getAllByDisplayValue('09:00')[0]).toBeInTheDocument();
    expect(within(dialog).getAllByDisplayValue('18:00')[0]).toBeInTheDocument();

    // Back at the default, so the button hides itself again.
    expect(
      within(dialog).queryByRole('button', { name: 'Reset to default' }),
    ).not.toBeInTheDocument();

    // Editing away from the default brings it back.
    await user.click(within(dialog).getByRole('checkbox', { name: 'Saturday' }));
    expect(
      within(dialog).getByRole('button', { name: 'Reset to default' }),
    ).toBeInTheDocument();
  });

  it('shows the weekly hours-range error outside the modal when the saved schedule is too short', () => {
    renderWithForm(
      [createDailyScheduleField()],
      {
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
      },
    );

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

  it('shows the weekly hours-range error live inside the modal and disables saving while it is out of range', async () => {
    const user = userEvent.setup();
    renderWithForm([createDailyScheduleField()], {
      work_schedule: 'full_time',
      daily_schedule: undefined,
    });

    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    const dialog = screen.getByRole('dialog');
    for (const day of ['Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
      await user.click(within(dialog).getByRole('checkbox', { name: day }));
    }

    expect(
      within(dialog).getByText('Work hours outside of weekly range'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Save schedule' }),
    ).toBeDisabled();
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

  describe('nested inside a parent fieldset (production `x-jsf-fieldsets` grouping)', () => {
    it('writes the whole schedule back in a single setValue call on save', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderNestedInFieldSet(
        [createDailyScheduleField({ type: 'fieldset', inputType: 'fieldset', fields: [] })],
        { daily_schedule: undefined },
      );

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Friday' }),
      );
      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

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
    });

    it('requires at least one selected day', async () => {
      const user = userEvent.setup();
      renderNestedInFieldSet(
        [createDailyScheduleField({ type: 'fieldset', inputType: 'fieldset', fields: [] })],
        { daily_schedule: undefined },
      );

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
  });
});
