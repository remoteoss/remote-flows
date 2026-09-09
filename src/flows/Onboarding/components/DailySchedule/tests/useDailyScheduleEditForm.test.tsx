import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDailyScheduleEditForm } from '@/src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm';
import { getDefaultsFromSchema } from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { germanyDailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/tests/fixtures';
import { DailyScheduleValue } from '@/src/flows/Onboarding/components/DailySchedule/types';

/**
 * Proves `useDailyScheduleEditForm` is usable on its own, with no
 * `DailySchedule`/`DailyScheduleContainer` involved — the point of extracting
 * it (PAY-2868 Phase 3 restructure): a consumer building a fully custom UI
 * for `daily_schedule` can bind bare inputs to this hook instead of
 * reimplementing the validation/save-mapping rules themselves.
 */
const defaults = getDefaultsFromSchema(germanyDailyScheduleMetadata);

function MinimalCustomUi({
  value,
  onSaved,
}: {
  value: DailyScheduleValue | undefined;
  onSaved: (value: DailyScheduleValue) => void;
}) {
  const { form, fields, handleSave, rootError } = useDailyScheduleEditForm({
    availableWorkDays: defaults.availableWorkDays,
    defaultSchedule: defaults.defaultSchedule,
    defaultStartTime: defaults.defaultStartTime,
    defaultEndTime: defaults.defaultEndTime,
    defaultBreakDurationMinutes: defaults.defaultBreakDurationMinutes,
    value,
    setValue: onSaved,
  });

  return (
    <div>
      {fields.map((field, index) => (
        <label key={field.id}>
          {field.day}
          <input
            type='checkbox'
            {...form.register(`schedule.${index}.checked`)}
            data-testid={`day-${field.day}`}
          />
        </label>
      ))}
      {rootError ? <p role='alert'>{rootError}</p> : null}
      <button type='button' onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

describe('useDailyScheduleEditForm', () => {
  it('saves the default schedule unmodified with no custom UI wiring beyond a Save button', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(<MinimalCustomUi value={undefined} onSaved={onSaved} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSaved).toHaveBeenCalledWith({
      selected_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      schedule: expect.objectContaining({
        monday: {
          start_time: '09:00',
          end_time: '18:00',
          break_duration_minutes: 60,
        },
      }),
    });
  });

  it('lets a bare <input> (no CheckBoxField/TextField) drive the same validated save', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(<MinimalCustomUi value={undefined} onSaved={onSaved} />);

    // Native checkboxes registered directly via react-hook-form's `register`
    // (no Radix/CheckBoxField in the way) don't toggle via userEvent's
    // pointer-event simulation in this jsdom setup; `fireEvent.click` does.
    fireEvent.click(screen.getByTestId('day-friday'));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const [savedValue] = onSaved.mock.calls[0];
    expect(savedValue.selected_days).toEqual([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
    ]);
  });
});
