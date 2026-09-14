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

  it('discards unsaved edits when the dialog is closed via Cancel button', async () => {
    const user = userEvent.setup();
    renderWithForm([createDailyScheduleField()], {
      daily_schedule: {
        selected_days: ['monday', 'tuesday'],
        schedule: {
          monday: {
            start_time: '09:00',
            end_time: '17:00',
            break_duration_minutes: 60,
          },
          tuesday: {
            start_time: '09:00',
            end_time: '17:00',
            break_duration_minutes: 60,
          },
        },
      },
    });

    // Open the dialog and make edits
    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
    let dialog = screen.getByRole('dialog');

    // Uncheck Tuesday and check Wednesday
    await user.click(within(dialog).getByRole('checkbox', { name: 'Tuesday' }));
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Wednesday' }),
    );

    // Verify edits are in the form
    await waitFor(() => {
      expect(
        within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
      ).not.toBeChecked();
      expect(
        within(dialog).getByRole('checkbox', { name: 'Wednesday' }),
      ).toBeChecked();
    });

    // Cancel without saving
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen the dialog
    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    // Wait for dialog to open and form to be reset
    await waitFor(() => {
      dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
      ).toBeChecked(); // Should be back to saved value
    });

    // Verify all saved values are restored
    expect(
      within(dialog).getByRole('checkbox', { name: 'Monday' }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole('checkbox', { name: 'Wednesday' }),
    ).not.toBeChecked(); // Should not be checked (edit was discarded)
  });

  it('resets to the latest saved schedule after save, not the original mount-time defaults', async () => {
    const user = userEvent.setup();
    const { getFormValues } = renderWithForm([createDailyScheduleField()], {
      daily_schedule: {
        selected_days: ['monday', 'tuesday'],
        schedule: {
          monday: {
            start_time: '09:00',
            end_time: '17:00',
            break_duration_minutes: 60,
          },
          tuesday: {
            start_time: '09:00',
            end_time: '17:00',
            break_duration_minutes: 60,
          },
        },
      },
    });

    // Open the dialog and make edits
    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
    let dialog = screen.getByRole('dialog');

    // Replace Tuesday with Wednesday
    await user.click(within(dialog).getByRole('checkbox', { name: 'Tuesday' }));
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Wednesday' }),
    );

    // Save the changes
    await user.click(
      within(dialog).getByRole('button', { name: 'Save schedule' }),
    );

    // Verify the save succeeded
    await waitFor(() => {
      const value = getFormValues().daily_schedule as {
        selected_days: string[];
        schedule: Record<string, unknown>;
      };
      expect(value.selected_days).toEqual(['monday', 'wednesday']);
    });

    // Reopen the dialog
    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));
    dialog = screen.getByRole('dialog');

    // Make new edits - add Thursday
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Thursday' }),
    );

    // Verify Thursday is checked
    await waitFor(() => {
      expect(
        within(dialog).getByRole('checkbox', { name: 'Thursday' }),
      ).toBeChecked();
    });

    // Cancel without saving
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen the dialog again
    await user.click(screen.getByRole('button', { name: 'Edit schedule' }));

    // Wait for dialog to open and verify it shows the LAST SAVED state
    // (Monday + Wednesday), not the original state (Monday + Tuesday)
    await waitFor(() => {
      dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByRole('checkbox', { name: 'Monday' }),
      ).toBeChecked();
      expect(
        within(dialog).getByRole('checkbox', { name: 'Wednesday' }),
      ).toBeChecked(); // Should show the saved value from first save
      expect(
        within(dialog).getByRole('checkbox', { name: 'Tuesday' }),
      ).not.toBeChecked(); // Should NOT show original value
      expect(
        within(dialog).getByRole('checkbox', { name: 'Thursday' }),
      ).not.toBeChecked(); // Should NOT show unsaved edit
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

      // Type invalid time in Monday (unchecked)
      const mondayStartInput = within(dialog).getAllByRole('textbox')[0];
      await user.clear(mondayStartInput);
      await user.type(mondayStartInput, '25:00');

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

      // Uncheck Monday - this should reset the field values and clear errors
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
      const allTextboxes = within(dialog).getAllByRole('textbox');
      // Friday is index 4, each row has 3 inputs: start (0), end (1), break (2)
      // Friday start time is at 4*3 = 12
      const fridayStartInput = allTextboxes[12];
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

  describe('Row hours display', () => {
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
