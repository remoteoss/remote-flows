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
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Saturday' }),
    );
    expect(
      within(dialog).getByRole('button', { name: 'Reset to default' }),
    ).toBeInTheDocument();
  });

  describe('Cancelling edits', () => {
    const savedSchedule = {
      selected_days: ['monday'],
      schedule: {
        monday: {
          start_time: '10:00',
          end_time: '14:00',
          break_duration_minutes: 15,
        },
      },
    };

    it('discards unsaved edits when Cancel is clicked, so reopening shows the last saved schedule', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: savedSchedule,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      let dialog = screen.getByRole('dialog');
      const mondayStartInput = within(dialog).getByDisplayValue('10:00');
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '11:00');
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
      );

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      dialog = screen.getByRole('dialog');

      expect(within(dialog).getByDisplayValue('10:00')).toBeInTheDocument();
      expect(
        within(dialog).queryByDisplayValue('11:00'),
      ).not.toBeInTheDocument();
      expect(
        within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
      ).not.toBeChecked();
    });

    it('does not write back previously cancelled edits on a later save', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderWithForm([createDailyScheduleField()], {
        daily_schedule: savedSchedule,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      let dialog = screen.getByRole('dialog');
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Friday' }),
      );
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      dialog = screen.getByRole('dialog');
      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      await waitFor(() => {
        const value = getFormValues().daily_schedule as {
          selected_days: string[];
        };
        expect(value.selected_days).toEqual(['monday']);
      });
    });
  });

  describe('Validation on blur', () => {
    it('shows validation error when invalid time format is entered and field is blurred', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0]; // First start time input

      // Type invalid time and blur
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '25:00');
      await user.tab(); // Trigger blur

      // Generic error should appear after blur
      expect(
        await within(dialog).findByText(
          /Please check the form for errors. Time fields must use HH:mm format/,
        ),
      ).toBeInTheDocument();
    });

    it('shows validation error when incomplete time format is entered (missing leading zero)', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];

      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '9:00'); // Missing leading zero
      await user.tab();

      expect(
        await within(dialog).findByText(/Please check the form for errors/),
      ).toBeInTheDocument();
    });

    it('does not show validation error when valid time format is entered', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];

      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '09:00');
      await user.tab();

      // No error should appear
      expect(
        within(dialog).queryByText(/Please check the form for errors/),
      ).not.toBeInTheDocument();
    });

    it('blocks save when invalid time format is present', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];

      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '25:00');

      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      // Error appears and form does not save
      expect(
        await within(dialog).findByText(/Please check the form for errors/),
      ).toBeInTheDocument();

      // Dialog should still be open (save was blocked)
      expect(dialog).toBeInTheDocument();
    });

    it('allows unchecked days with invalid times to not block save', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderWithForm([createDailyScheduleField()], {
        daily_schedule: {
          selected_days: ['tuesday'],
          schedule: {
            tuesday: {
              start_time: '09:00',
              end_time: '18:00',
              break_duration_minutes: 60,
            },
          },
        },
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');

      // Check Monday (to enable its inputs)
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Monday' }),
      );

      // Type invalid time in Monday (now checked and editable)
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '25:00');
      await user.tab(); // Trigger validation

      // Error should appear for Monday
      expect(
        await within(dialog).findByText(/Please check the form for errors/),
      ).toBeInTheDocument();

      // Uncheck Monday - this should clear the error (invalid data stays but doesn't block save)
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Monday' }),
      );

      // Error should be cleared
      await waitFor(() => {
        expect(
          within(dialog).queryByText(/Please check the form for errors/),
        ).not.toBeInTheDocument();
      });

      // Tuesday is checked and valid, should save successfully
      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      await waitFor(() => {
        const value = getFormValues().daily_schedule as {
          selected_days: string[];
          schedule: Record<string, unknown>;
        };
        expect(value.selected_days).toEqual(['tuesday']);
        expect(value.schedule.monday).toBeUndefined(); // Unchecked day not saved
      });
    });

    it('clears validation errors when a day with invalid time is unchecked', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];

      // Type invalid time in Monday (checked) and blur
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '25:00');
      await user.tab();

      // Error should appear
      expect(
        await within(dialog).findByText(/Please check the form for errors/),
      ).toBeInTheDocument();

      // Uncheck Monday - this should clear errors (but keep the invalid value in the disabled field)
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Monday' }),
      );

      // Error should be cleared after unchecking
      await waitFor(() => {
        expect(
          within(dialog).queryByText(/Please check the form for errors/),
        ).not.toBeInTheDocument();
      });
    });

    it('clears validation errors when unchecking a day that became checked after reset (regression for prevCheckedRef sync)', async () => {
      const user = userEvent.setup();
      // Start with only Monday checked. Default will be Monday-Friday.
      // This means Friday is initially UNCHECKED (not in the saved value)
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

      // Initially: Only Monday is checked, Friday is unchecked
      // prevCheckedRef[friday_index] = false
      const fridayCheckbox = within(dialog).getByRole('checkbox', {
        name: 'Friday',
      });
      expect(fridayCheckbox).not.toBeChecked();

      // Reset to default (Monday-Friday) - Friday becomes CHECKED
      await user.click(
        within(dialog).getByRole('button', { name: 'Reset to default' }),
      );

      // After reset, Friday should be checked (it's in the default schedule)
      // WITHOUT FIX: prevCheckedRef[friday] is still false (stale!)
      // WITH FIX: prevCheckedRef[friday] = true (synced with reset)
      let fridayAfterReset: HTMLElement;
      await waitFor(() => {
        fridayAfterReset = within(dialog).getByRole('checkbox', {
          name: 'Friday',
        });
        expect(fridayAfterReset).toBeChecked();
      });

      // Add invalid time to Friday (which is now checked)
      // Query textboxes after the DOM has stabilized from the reset
      const allTextboxes = within(dialog).getAllByRole('textbox');
      // getAllByRole('textbox') returns only text inputs (start_time, end_time), not number inputs (break)
      // Each day has 2 textboxes: start (even index), end (odd index)
      // Friday is day index 4: start_time is at textbox index 4*2 = 8
      const fridayStartInput = allTextboxes[8];

      // Clear and type invalid time
      await user.clear(fridayStartInput);
      await user.type(fridayStartInput, '99:99');
      await user.tab();

      // Validation error should appear
      expect(
        await within(dialog).findByText(/Please check the form for errors/),
      ).toBeInTheDocument();

      await user.click(fridayAfterReset!);

      // Error should be cleared after unchecking
      await waitFor(() => {
        expect(
          within(dialog).queryByText(/Please check the form for errors/),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Dialog close behavior', () => {
    it('keeps dialog open when validation fails on save (regression: stale formState.errors)', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      const dialog = screen.getByRole('dialog');

      // Enter invalid time format in a checked day
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '99:99'); // Invalid time

      // Click save - validation should fail
      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      // Dialog must stay open because validation failed
      // The bug was: dialog would close because formState.errors was stale
      await waitFor(() => {
        expect(
          within(dialog).getByText(/Please check the form for errors/),
        ).toBeInTheDocument();
      });

      // Verify dialog is still open
      expect(screen.getByRole('dialog', { hidden: false })).toBeInTheDocument();
    });

    it('closes dialog when validation succeeds after prior blur errors (regression: stale formState.errors)', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      let dialog = screen.getByRole('dialog');

      // Step 1: Enter invalid time and blur to trigger error
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '99:99');
      await user.tab(); // Blur to trigger validation

      // Error should appear
      expect(
        await within(dialog).findByText(/Please check the form for errors/),
      ).toBeInTheDocument();

      // Step 2: Fix the error
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '09:00'); // Valid time

      // Step 3: Save - validation should now pass
      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      // Dialog must close because validation passed
      // The bug was: dialog would stay open because formState.errors still had old errors
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify the form was saved
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
          'friday',
        ]);
      });
    });

    it('closes dialog immediately on successful save with no prior errors', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderWithForm([createDailyScheduleField()], {
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
      const dialog = screen.getByRole('dialog');

      // Make a valid change (uncheck Friday)
      await user.click(
        within(dialog).getByRole('checkbox', { name: 'Friday' }),
      );

      // Save - should succeed and close immediately
      await user.click(
        within(dialog).getByRole('button', { name: 'Save schedule' }),
      );

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify save completed
      await waitFor(() => {
        const value = getFormValues().daily_schedule as {
          selected_days: string[];
        };
        expect(value.selected_days).toEqual([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
        ]);
      });
    });
  });

  describe('Row hours display', () => {
    it('shows "-" instead of NaN when typing incomplete time format', async () => {
      const user = userEvent.setup();
      renderWithForm(
        [
          createDailyScheduleField({
            metadata: {
              ...germanyDailyScheduleMetadata,
              default_schedule: [
                {
                  day: 'monday',
                  start_time: '09:00',
                  end_time: '18:00',
                  break_duration_minutes: 60,
                },
              ],
              work_days: ['monday'],
            },
          }),
        ],
        { daily_schedule: undefined },
      );

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');

      // Initially shows valid hours (09:00-18:00 with 60min break = 8h)
      expect(within(dialog).getByText('8h')).toBeInTheDocument();

      // Clear and type incomplete time "09" (missing ":00")
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '09');

      // Should show "-" not "NaNh" while typing - the hours cell should not contain NaN
      await waitFor(() => {
        expect(within(dialog).queryByText(/NaN/)).not.toBeInTheDocument();
        // With incomplete time, hours should be 0, which displays as "-"
        const rows = within(dialog).getAllByText('-');
        expect(rows.length).toBeGreaterThan(0); // At least one "-" for the incomplete time
      });

      // Complete the time to valid "09:00"
      await user.type(mondayStartInput, ':00');

      // Should now show valid hours again (09:00-18:00 with 60min break = 8h)
      await waitFor(() => {
        expect(within(dialog).getByText('8h')).toBeInTheDocument();
      });
    });

    it('does not show a false weekly hours-range error while a time field is mid-edit (regression: NaN from incomplete time)', async () => {
      const user = userEvent.setup();
      renderWithForm([createDailyScheduleField()], {
        work_schedule: 'full_time',
        daily_schedule: undefined,
      });

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');

      // Default Mon-Fri schedule is 40h, within the full-time range (31-48h)
      expect(
        within(dialog).queryByText('Work hours outside of weekly range'),
      ).not.toBeInTheDocument();

      // Clear and type an incomplete time - previously this turned
      // totalWeeklyHours into NaN, which fails every range comparison and
      // incorrectly showed "Work hours outside of weekly range"
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '09');

      await waitFor(() => {
        expect(
          within(dialog).queryByText('Work hours outside of weekly range'),
        ).not.toBeInTheDocument();
      });

      // Completing the time restores a valid, in-range schedule
      await user.type(mondayStartInput, ':00');

      await waitFor(() => {
        expect(
          within(dialog).queryByText('Work hours outside of weekly range'),
        ).not.toBeInTheDocument();
      });
    });

    it('row hours match summary hours when subtractBreaksFromWorkHours is false', async () => {
      const user = userEvent.setup();
      renderWithForm(
        [
          createDailyScheduleField({
            metadata: {
              ...germanyDailyScheduleMetadata,
              subtract_breaks_in_work_hours: false,
              default_schedule: [
                {
                  day: 'monday',
                  start_time: '09:00',
                  end_time: '17:00',
                  break_duration_minutes: 60,
                },
              ],
              work_days: ['monday'],
            },
          }),
        ],
        { daily_schedule: undefined },
      );

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');

      // Row should show 8h (09:00-17:00 = 8h, break not subtracted)
      expect(within(dialog).getByText('8h')).toBeInTheDocument();

      // Summary should also show 8h per week
      expect(
        within(dialog).getByText(byOwnText('Total of 8 hours per week')),
      ).toBeInTheDocument();
    });

    it('row hours match summary hours when subtractBreaksFromWorkHours is true', async () => {
      const user = userEvent.setup();
      renderWithForm(
        [
          createDailyScheduleField({
            metadata: {
              ...germanyDailyScheduleMetadata,
              subtract_breaks_in_work_hours: true,
              default_schedule: [
                {
                  day: 'monday',
                  start_time: '09:00',
                  end_time: '17:00',
                  break_duration_minutes: 60,
                },
              ],
              work_days: ['monday'],
            },
          }),
        ],
        { daily_schedule: undefined },
      );

      await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

      const dialog = screen.getByRole('dialog');

      // Row should show 7h (09:00-17:00 = 8h, minus 1h break = 7h)
      expect(within(dialog).getByText('7h')).toBeInTheDocument();

      // Summary should also show 7h per week
      expect(
        within(dialog).getByText(byOwnText('Total of 7 hours per week')),
      ).toBeInTheDocument();
    });
  });
});
