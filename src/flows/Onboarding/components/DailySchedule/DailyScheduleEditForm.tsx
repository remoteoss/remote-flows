import { Form } from '@/src/components/ui/form';
import { calculateWorkingHours } from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { CheckBoxField } from '@/src/components/form/fields/CheckBoxField';
import { TextField } from '@/src/components/form/fields/TextField';
import { DailyScheduleSummaryBody } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleSummaryBody';
import { DailyScheduleHoursErrorBanner } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleHoursErrorBanner';
import { Button } from '@/src/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { memo } from 'react';
import { useWatch, UseFormReturn, FieldArrayWithId } from 'react-hook-form';
import {
  DailyScheduleEditFormRow,
  DailyScheduleEditFormData,
  useDailyScheduleEditForm,
} from '@/src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm';
import { useDialogControl } from '@/src/flows/Onboarding/components/DailySchedule/EditEmployeeWorkingHoursDialog';
import { WEEKDAY_LABELS } from '@/src/flows/Onboarding/components/DailySchedule/constants';

// Memoized day row to prevent unnecessary re-renders
// Uses per-row useWatch for optimal performance
const DayRow = memo(
  ({
    field,
    index,
    form,
  }: {
    field: FieldArrayWithId<DailyScheduleEditFormData, 'schedule', 'id'>;
    index: number;
    form: UseFormReturn<DailyScheduleEditFormData>;
  }) => {
    // Watch only THIS row's values for hours calculation and disabled state
    // More performant than watching the entire schedule array
    const currentRow = useWatch({
      control: form.control,
      name: `schedule.${index}`,
    }) as DailyScheduleEditFormRow;

    const hours = calculateWorkingHours(
      currentRow?.start_time,
      currentRow?.end_time,
      Number(currentRow?.break_duration_minutes) || 0,
    );

    const hoursDisplay = currentRow?.checked
      ? Number.isNaN(hours)
        ? '-'
        : `${hours}h`
      : '-';

    return (
      <div
        key={field.id}
        className='grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__DailyScheduleForm__Row'
      >
        <div className='col-span-3'>
          <CheckBoxField
            label={WEEKDAY_LABELS[field.day]}
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
          {hoursDisplay}
        </div>
      </div>
    );
  },
);

DayRow.displayName = 'DayRow';

type DailyScheduleEditFormProps = ReturnType<
  typeof useDailyScheduleEditForm
> & {
  subtractBreaksFromWorkHours: boolean;
};

export const DailyScheduleEditForm = ({
  form,
  fields,
  unsavedSummaryDays,
  hoursRangeError,
  handleSave: hookHandleSave,
  handleReset,
  isDirty,
  selectionError,
  subtractBreaksFromWorkHours,
}: DailyScheduleEditFormProps) => {
  const { close } = useDialogControl();

  const handleSave = async () => {
    await hookHandleSave();
    // Only close if there are no validation errors
    if (Object.keys(form.formState.errors).length === 0) {
      close();
    }
  };

  const hasFieldErrors = Object.keys(form.formState.errors).length > 0;

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
          {fields.map((field, index) => (
            <DayRow key={field.id} field={field} index={index} form={form} />
          ))}
        </div>

        <div className='rounded-lg border p-4 RemoteFlows__DailyScheduleForm__Preview'>
          <DailyScheduleSummaryBody
            days={unsavedSummaryDays}
            subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
          />
        </div>

        <DailyScheduleHoursErrorBanner error={hoursRangeError} />

        {selectionError ? (
          <p className='text-destructive text-sm mb-0'>{selectionError}</p>
        ) : null}

        {!selectionError && hasFieldErrors && (
          <p className='text-destructive text-sm mb-0'>
            Please check the form for errors. Time fields must use HH:mm format
            (e.g., 09:00), and all checked days must have start time, end time,
            and break duration filled in.
          </p>
        )}

        <div className='flex items-center gap-4 pt-4'>
          {isDirty && (
            <Button
              type='button'
              variant='ghost'
              className='gap-2 RemoteFlows__DailyScheduleForm__ResetButton'
              onClick={handleReset}
            >
              <RotateCcw className='h-4 w-4' />
              Reset to default
            </Button>
          )}
          <div className='flex gap-4 ml-auto'>
            <Button type='button' variant='outline' onClick={close}>
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSave}
              disabled={!!hoursRangeError}
            >
              Save schedule
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
