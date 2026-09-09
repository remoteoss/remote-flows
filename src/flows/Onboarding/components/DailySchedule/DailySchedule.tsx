import { useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
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
import {
  DailyScheduleRenderProps,
  Weekday,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  buildDailyScheduleSummary,
  calculateWorkingHours,
  resolveDailyScheduleValue,
  DailyScheduleSummaryDay,
  DailyScheduleSummarySegment,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { useDailyScheduleEditForm } from '@/src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm';

/**
 * Default UI for the `daily_schedule` field (PAY-2868), matching Dragon's
 * `WorkScheduleFieldForJSONSchema` UX (reference MR
 * gitlab.com/remote-com/employ-starbase/dragon/-/merge_requests/49203):
 * a summary of the current schedule + an "Edit" action opening a modal to
 * pick work days and set per-day start/end/break times. All validation and
 * save-mapping logic lives in `useDailyScheduleEditForm` — this component is
 * markup only, so a consumer replacing it doesn't need to reimplement
 * either. See plans/daily-schedule-field.md.
 */

const DAY_LABELS: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function DailyScheduleSummarySegments({
  segments,
}: {
  segments: DailyScheduleSummarySegment[];
}) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.bold ? (
          <strong key={index}>{segment.text}</strong>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}

/**
 * The Dragon-style schedule summary: grouped work-hours/break lines + total,
 * shared between the read-only view and the edit modal's live preview so
 * both always render identically.
 */
function DailyScheduleSummaryBody({
  days,
  subtractBreaksFromWorkHours,
}: {
  days: DailyScheduleSummaryDay[];
  subtractBreaksFromWorkHours: boolean;
}) {
  if (days.length === 0) {
    return (
      <p className='text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Empty'>
        No work days selected yet.
      </p>
    );
  }

  const { workHoursLines, breakLines, totalWeeklyHours } =
    buildDailyScheduleSummary(days, subtractBreaksFromWorkHours);

  return (
    <div className='flex flex-col gap-1 text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Lines'>
      {workHoursLines.map((line) => (
        <p key={line.key}>
          <DailyScheduleSummarySegments segments={line.segments} />
        </p>
      ))}
      {breakLines.map((line) => (
        <p key={line.key}>
          <DailyScheduleSummarySegments segments={line.segments} />
        </p>
      ))}
      <p className='RemoteFlows__DailySchedule__Summary__Total'>
        Total of <strong>{totalWeeklyHours} hours</strong> per week
      </p>
    </div>
  );
}

function DailyScheduleEditForm({
  availableWorkDays,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  subtractBreaksFromWorkHours,
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
  | 'subtractBreaksFromWorkHours'
  | 'value'
  | 'setValue'
> & { onClose: () => void }) {
  const { form, fields, watchedSchedule, handleSave, rootError } =
    useDailyScheduleEditForm({
      availableWorkDays,
      defaultSchedule,
      defaultStartTime,
      defaultEndTime,
      defaultBreakDurationMinutes,
      value,
      setValue,
      onSaved: onClose,
    });

  const hasFieldErrors = Object.keys(form.formState.errors).length > 0;

  const previewDays: DailyScheduleSummaryDay[] = watchedSchedule
    .filter((row) => row.checked)
    .map((row) => ({
      day: row.day,
      start_time: row.start_time,
      end_time: row.end_time,
      break_duration_minutes: Number(row.break_duration_minutes) || 0,
    }));

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

        <div className='rounded-lg border p-4 RemoteFlows__DailyScheduleForm__Preview'>
          <DailyScheduleSummaryBody
            days={previewDays}
            subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
          />
        </div>

        {rootError ? (
          <p className='text-destructive text-sm mb-0'>{rootError}</p>
        ) : null}

        {!rootError && hasFieldErrors && (
          <p className='text-destructive text-sm mb-0'>
            Please check the form for errors. Time fields must use HH:mm format
            (e.g., 09:00), and all checked days must have start time, end time,
            and break duration filled in.
          </p>
        )}

        <div className='flex gap-4 pt-4'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSave}>
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
  const summaryDays: DailyScheduleSummaryDay[] =
    effectiveValue.selected_days.map((day) => {
      const daySchedule = effectiveValue.schedule[day];
      return {
        day,
        start_time: daySchedule?.start_time ?? '',
        end_time: daySchedule?.end_time ?? '',
        break_duration_minutes: daySchedule?.break_duration_minutes ?? 0,
      };
    });

  return (
    <div className='flex flex-col gap-3 RemoteFlows__DailySchedule'>
      <div className='flex items-center gap-2 RemoteFlows__DailySchedule__Header'>
        <p className='text-sm font-medium RemoteFlows__DailySchedule__Title'>
          Daily schedule
        </p>
        <Badge
          variant='secondary'
          className='RemoteFlows__DailySchedule__Badge'
        >
          customized hours (employee&apos;s timezone)
        </Badge>
      </div>
      <div className='flex flex-col gap-1 RemoteFlows__DailySchedule__Summary'>
        <DailyScheduleSummaryBody
          days={summaryDays}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
        />

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
              subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
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
