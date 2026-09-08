import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Form } from '@/src/components/ui/form';
import { CheckBoxField } from '@/src/components/form/fields/CheckBoxField';
import { TextField } from '@/src/components/form/fields/TextField';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  DailyScheduleRenderProps,
  Weekday,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  calculateWorkingHours,
  resolveDailyScheduleValue,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';

/**
 * Default UI for the `daily_schedule` field (PAY-2868), matching Dragon's
 * `WorkScheduleFieldForJSONSchema` UX (reference MR
 * gitlab.com/remote-com/employ-starbase/dragon/-/merge_requests/49203):
 * a summary of the current schedule + an "Edit" action opening a modal to
 * pick work days and set per-day start/end/break times. See
 * plans/daily-schedule-field.md.
 */

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const DAY_LABELS: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

type DayRow = {
  day: Weekday;
  checked: boolean;
  start_time: string;
  end_time: string;
  break_duration_minutes: string;
};

type DailyScheduleFormData = {
  schedule: DayRow[];
};

const dayRowSchema = z
  .object({
    day: z.string().min(1),
    checked: z.boolean(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    break_duration_minutes: z.string().optional().nullable(),
  })
  .superRefine((row, ctx) => {
    for (const field of ['start_time', 'end_time'] as const) {
      const value = row[field];
      if (value && !TIME_PATTERN.test(value)) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Invalid time format (HH:mm)',
        });
      } else if (row.checked && !value) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Required' });
      }
    }

    if (row.checked) {
      if (!row.break_duration_minutes) {
        ctx.addIssue({
          code: 'custom',
          path: ['break_duration_minutes'],
          message: 'Required',
        });
      } else if (!/^\d+$/.test(row.break_duration_minutes)) {
        ctx.addIssue({
          code: 'custom',
          path: ['break_duration_minutes'],
          message: 'Must be a whole number of minutes',
        });
      }
    }
  });

const formSchema = z.object({
  schedule: z
    .array(dayRowSchema)
    .refine((rows) => rows.some((row) => row.checked), {
      message: 'Select at least one work day',
    }),
});

function buildDefaultRows({
  availableWorkDays,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  value,
}: Pick<
  DailyScheduleRenderProps,
  | 'availableWorkDays'
  | 'defaultSchedule'
  | 'defaultStartTime'
  | 'defaultEndTime'
  | 'defaultBreakDurationMinutes'
  | 'value'
>): DayRow[] {
  const effectiveValue = resolveDailyScheduleValue({ value, defaultSchedule });

  return availableWorkDays.map((day) => {
    const daySchedule = effectiveValue.schedule[day];

    return {
      day,
      checked: effectiveValue.selected_days.includes(day),
      start_time: daySchedule?.start_time ?? defaultStartTime,
      end_time: daySchedule?.end_time ?? defaultEndTime,
      break_duration_minutes: String(
        daySchedule?.break_duration_minutes ?? defaultBreakDurationMinutes,
      ),
    };
  });
}

function DailyScheduleEditForm({
  availableWorkDays,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  value,
  setValue,
  onClose,
}: Pick<
  DailyScheduleRenderProps,
  | 'availableWorkDays'
  | 'defaultSchedule'
  | 'defaultStartTime'
  | 'defaultEndTime'
  | 'defaultBreakDurationMinutes'
  | 'value'
  | 'setValue'
> & { onClose: () => void }) {
  const form = useForm<DailyScheduleFormData>({
    defaultValues: {
      schedule: buildDefaultRows({
        availableWorkDays,
        defaultSchedule,
        defaultStartTime,
        defaultEndTime,
        defaultBreakDurationMinutes,
        value,
      }),
    },
    resolver: zodResolver(formSchema) as $TSFixMe,
  });

  const { handleSubmit, watch, control, formState } = form;
  const { fields } = useFieldArray({ name: 'schedule', control });
  const watchedSchedule = watch('schedule');

  function handleSave(data: DailyScheduleFormData) {
    const selectedRows = data.schedule.filter((row) => row.checked);

    setValue({
      selected_days: selectedRows.map((row) => row.day),
      schedule: selectedRows.reduce(
        (acc, row) => ({
          ...acc,
          [row.day]: {
            start_time: row.start_time,
            end_time: row.end_time,
            break_duration_minutes: Number(row.break_duration_minutes),
          },
        }),
        {},
      ),
    });
    onClose();
  }

  // `schedule` is a field array; a whole-array `.refine()` failure (as
  // opposed to a per-row error) lands under `.root`, not directly on
  // `.message` — react-hook-form normalizes this for registered field
  // arrays regardless of resolver.
  const rootError = formState.errors.schedule?.root?.message;

  return (
    <Form {...form}>
      <form className='space-y-4 RemoteFlows__DailyScheduleForm'>
        <p className='text-gray-600 text-sm mb-4 RemoteFlows__DailyScheduleForm__Description'>
          The times displayed are in the employee&apos;s time zone in the
          24-hour format.
        </p>

        <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide RemoteFlows__DailyScheduleForm__Header'>
          <div className='col-span-3'></div>
          <div className='col-span-3 text-center'>Start</div>
          <div className='col-span-3 text-center'>End</div>
          <div className='col-span-3 text-center'>Break (minutes)</div>
        </div>

        <div className='RemoteFlows__DailyScheduleForm__Rows'>
          {fields.map((field, index) => {
            const currentRow = watchedSchedule[index];
            const hours = calculateWorkingHours(
              currentRow?.start_time,
              currentRow?.end_time,
              Number(currentRow?.break_duration_minutes) || 0,
            );

            return (
              <div
                key={field.id}
                className='grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__DailyScheduleForm__Row'
              >
                <div className='col-span-3'>
                  <CheckBoxField
                    label={DAY_LABELS[field.day]}
                    name={`schedule.${index}.checked`}
                  />
                </div>
                <div className='col-span-3'>
                  <TextField
                    name={`schedule.${index}.start_time`}
                    includeErrorMessage={false}
                    disabled={!currentRow?.checked}
                  />
                </div>
                <div className='col-span-3'>
                  <TextField
                    name={`schedule.${index}.end_time`}
                    includeErrorMessage={false}
                    disabled={!currentRow?.checked}
                  />
                </div>
                <div className='col-span-2'>
                  <TextField
                    name={`schedule.${index}.break_duration_minutes`}
                    includeErrorMessage={false}
                    disabled={!currentRow?.checked}
                  />
                </div>
                <div className='col-span-1 text-center text-sm text-gray-500 RemoteFlows__DailyScheduleForm__Row__Hours'>
                  {currentRow?.checked ? `${hours}h` : '-'}
                </div>
              </div>
            );
          })}
        </div>

        {rootError ? (
          <p className='text-destructive text-sm mb-0'>{rootError}</p>
        ) : null}

        <div className='flex gap-4 pt-4'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit(handleSave)}>
            Save schedule
          </Button>
        </div>
      </form>
    </Form>
  );
}

export type DailyScheduleProps = DailyScheduleRenderProps;

export const DailySchedule = ({
  availableWorkDays,
  countryName,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  subtractBreaksFromWorkHours,
  value,
  setValue,
}: DailyScheduleProps) => {
  const [open, setOpen] = useState(false);

  const effectiveValue = resolveDailyScheduleValue({ value, defaultSchedule });
  const selectedDays = effectiveValue.selected_days;
  const totalWeeklyHours = selectedDays.reduce((total, day) => {
    const daySchedule = effectiveValue.schedule[day];
    return (
      total +
      calculateWorkingHours(
        daySchedule?.start_time,
        daySchedule?.end_time,
        subtractBreaksFromWorkHours ? daySchedule?.break_duration_minutes : 0,
      )
    );
  }, 0);

  return (
    <div className='flex flex-col gap-3 RemoteFlows__DailySchedule'>
      <p className='text-sm RemoteFlows__DailySchedule__Title'>
        Work hours in {countryName}
      </p>
      <div className='flex flex-col gap-1 RemoteFlows__DailySchedule__Summary'>
        {selectedDays.length > 0 ? (
          <ul className='text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Days'>
            {selectedDays.map((day) => {
              const daySchedule = effectiveValue.schedule[day];
              const summaryLine = `${DAY_LABELS[day]}: ${daySchedule?.start_time} - ${daySchedule?.end_time} (${daySchedule?.break_duration_minutes}min break)`;

              return <li key={day}>{summaryLine}</li>;
            })}
          </ul>
        ) : (
          <p className='text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Empty'>
            No work days selected yet.
          </p>
        )}
        <p className='text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Total'>
          Total of <span>{totalWeeklyHours}</span> hours per week
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant='link'
              className='flex items-center p-0 self-start RemoteFlows__DailySchedule__Trigger'
            >
              Edit schedule
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-4 RemoteFlows__DailySchedule__Content'>
            <DialogHeader>
              <DialogTitle className='RemoteFlows__DailySchedule__Title'>
                Edit employee working hours
              </DialogTitle>
            </DialogHeader>
            <DailyScheduleEditForm
              availableWorkDays={availableWorkDays}
              defaultSchedule={defaultSchedule}
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              defaultBreakDurationMinutes={defaultBreakDurationMinutes}
              value={value}
              setValue={setValue}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
