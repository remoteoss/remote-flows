import { DailyScheduleSummaryBody } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleSummaryBody';
import { DailyScheduleHoursErrorBanner } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleHoursErrorBanner';
import { Button } from '@/src/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useDailyScheduleEditForm } from '@/src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm';
import { useDialogControl } from '@/src/flows/Onboarding/components/DailySchedule/EditEmployeeWorkingHoursDialog';
import { WEEKDAY_LABELS } from '@/src/flows/Onboarding/components/DailySchedule/constants';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

type DailyScheduleEditFormProps = ReturnType<
  typeof useDailyScheduleEditForm
> & {
  subtractBreaksFromWorkHours: boolean;
};

export const DailyScheduleEditForm = ({
  state,
  actions,
  subtractBreaksFromWorkHours,
}: DailyScheduleEditFormProps) => {
  const { close, cancel } = useDialogControl();

  const handleSave = async () => {
    await actions.save();
    // Only close if validation passed
    if (actions.validate()) {
      close();
    }
  };

  return (
    <div className='space-y-4 RemoteFlows__DailyScheduleForm'>
      <p className='text-gray-600 text-sm mb-4 RemoteFlows__DailyScheduleForm__Description'>
        The times displayed are in the employee&apos;s time zone in the 24-hour
        format.
      </p>

      <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide RemoteFlows__DailyScheduleForm__Header'>
        <div className='col-span-3'></div>
        <div className='col-span-3 text-center'>Start</div>
        <div className='col-span-3 text-center'>End</div>
        <div className='col-span-3 text-center'>Break (minutes)</div>
      </div>

      <div className='RemoteFlows__DailyScheduleForm__Rows'>
        {state.rows.map((row, index) => (
          <div
            key={row.day}
            className='grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__DailyScheduleForm__Row'
          >
            <div className='col-span-3'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id={`schedule-${index}-checked`}
                  checked={row.checked}
                  onCheckedChange={() => actions.toggleDay(index)}
                />
                <Label htmlFor={`schedule-${index}-checked`}>
                  {WEEKDAY_LABELS[row.day]}
                </Label>
              </div>
            </div>
            <div className='col-span-3'>
              <Input
                type='text'
                value={row.start_time}
                onChange={(e) =>
                  actions.updateRow(index, 'start_time', e.target.value)
                }
                onBlur={() => actions.triggerValidation(index, 'start_time')}
                disabled={!row.checked}
                placeholder='HH:mm'
                aria-invalid={!!state.getFieldError(index, 'start_time')}
                className={
                  state.getFieldError(index, 'start_time')
                    ? 'border-destructive'
                    : ''
                }
              />
            </div>
            <div className='col-span-3'>
              <Input
                type='text'
                value={row.end_time}
                onChange={(e) =>
                  actions.updateRow(index, 'end_time', e.target.value)
                }
                onBlur={() => actions.triggerValidation(index, 'end_time')}
                disabled={!row.checked}
                placeholder='HH:mm'
                aria-invalid={!!state.getFieldError(index, 'end_time')}
                className={
                  state.getFieldError(index, 'end_time')
                    ? 'border-destructive'
                    : ''
                }
              />
            </div>
            <div className='col-span-2'>
              <Input
                type='number'
                value={row.break_duration_minutes}
                onChange={(e) =>
                  actions.updateRow(
                    index,
                    'break_duration_minutes',
                    e.target.value,
                  )
                }
                onBlur={() =>
                  actions.triggerValidation(index, 'break_duration_minutes')
                }
                disabled={!row.checked}
                placeholder='Minutes'
                aria-invalid={
                  !!state.getFieldError(index, 'break_duration_minutes')
                }
                className={
                  state.getFieldError(index, 'break_duration_minutes')
                    ? 'border-destructive'
                    : ''
                }
              />
            </div>
            <div className='col-span-1 text-center text-sm text-gray-500 RemoteFlows__DailyScheduleForm__Row__Hours'>
              {row.checked ? (row.hours > 0 ? `${row.hours}h` : '-') : '-'}
            </div>
          </div>
        ))}
      </div>

      <div className='rounded-lg border p-4 RemoteFlows__DailyScheduleForm__Preview'>
        <DailyScheduleSummaryBody
          days={state.unsavedSummaryDays}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
        />
      </div>

      <DailyScheduleHoursErrorBanner error={state.hoursRangeError} />

      {state.selectionError ? (
        <p className='text-destructive text-sm mb-0'>{state.selectionError}</p>
      ) : null}

      {!state.selectionError && state.hasFieldErrors && (
        <p className='text-destructive text-sm mb-0'>
          Please check the form for errors. Time fields must use HH:mm format
          (e.g., 09:00), and all checked days must have start time, end time,
          and break duration filled in.
        </p>
      )}

      <div className='flex items-center gap-4 pt-4'>
        {state.isDirty && (
          <Button
            type='button'
            variant='ghost'
            className='gap-2 RemoteFlows__DailyScheduleForm__ResetButton'
            onClick={actions.reset}
          >
            <RotateCcw className='h-4 w-4' />
            Reset to default
          </Button>
        )}
        <div className='flex gap-4 ml-auto'>
          <Button type='button' variant='outline' onClick={cancel}>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            disabled={!!state.hoursRangeError}
          >
            Save schedule
          </Button>
        </div>
      </div>
    </div>
  );
};
