import { Fragment, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  calculateHours,
  DailySchedule,
  DAYS_OF_THE_WEEK,
  getShortWeekday,
  WorkScheduleComponentProps,
} from '@remoteoss/remote-flows';

type WorkScheduleFormData = {
  schedule: DailySchedule[];
};

type WorkScheduleSelectionProps = {
  defaultSchedule: DailySchedule[];
  onSubmit: (data: DailySchedule[]) => void;
};

function WorkScheduleSelectionForm({
  defaultSchedule,
  onSubmit,
}: WorkScheduleSelectionProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const transformedSchedule = DAYS_OF_THE_WEEK.map((day) => {
    const existingSchedule = defaultSchedule.find(
      (schedule) =>
        schedule.day.toLowerCase() === getShortWeekday(day).toLowerCase() ||
        schedule.day.toLowerCase() === day.toLowerCase(),
    );

    if (existingSchedule) {
      return { ...existingSchedule, day: getShortWeekday(day), checked: true };
    }

    return {
      ...defaultSchedule[0],
      checked: false,
      day: getShortWeekday(day),
    };
  });

  const { handleSubmit, watch, reset, control, register, formState } =
    useForm<WorkScheduleFormData>({
      defaultValues: { schedule: transformedSchedule },
    });

  const { fields } = useFieldArray({ name: 'schedule', control });
  const watchedSchedule = watch('schedule');

  function handleSubmitWorkingHours(data: WorkScheduleFormData) {
    const schedule = data.schedule
      .filter(({ checked }) => checked)
      .map((day) => ({ ...day, hours: calculateHours(day) }));

    onSubmit(schedule);
    setOpenDialog(false);
  }

  function handleCancel() {
    reset();
    setOpenDialog(false);
  }

  return (
    <div className='flex items-center justify-between'>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button
            variant='link'
            className='flex items-center p-0 RemoteFlows__WorkScheduleSelectionForm__Trigger'
          >
            Edit Schedule
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-4 RemoteFlows__WorkScheduleSelectionForm__Content'>
          <DialogHeader>
            <DialogTitle className='RemoteFlows__WorkScheduleSelectionForm__Title'>
              Edit employee working hours
            </DialogTitle>
          </DialogHeader>

          <form className='space-y-4 RemoteFlows__WorkScheduleSelectionForm__Form'>
            <div className='rounded-lg'>
              <p className='text-gray-600 text-sm mb-4 RemoteFlows__WorkScheduleSelectionForm__Description'>
                The times displayed are in the employee's time zone in the
                24-hour format.
              </p>

              <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide RemoteFlows__WorkScheduleSelectionForm__Header'>
                <div className='col-span-2'></div>
                <div className='col-span-3 text-center'>START</div>
                <div className='col-span-1 text-center'></div>
                <div className='col-span-3 text-center'>END</div>
                <div className='col-span-2 text-center'>HOURS</div>
              </div>

              <div className='RemoteFlows__WorkScheduleSelectionForm__Rows'>
                {fields.map((field, index) => {
                  const currentDay = watchedSchedule[index];
                  const calculatedHours = calculateHours(currentDay);

                  return (
                    <Fragment key={field.id}>
                      <div className='grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__WorkScheduleSelectionForm__Row-Hours'>
                        <div className='col-span-2 flex items-center gap-3'>
                          <Controller
                            control={control}
                            name={`schedule.${index}.checked`}
                            render={({ field: checkboxField }) => (
                              <div className='flex items-center gap-2'>
                                <Checkbox
                                  id={`schedule-${index}-checked`}
                                  checked={checkboxField.value}
                                  onCheckedChange={checkboxField.onChange}
                                />
                                <label
                                  htmlFor={`schedule-${index}-checked`}
                                  className='text-sm'
                                >
                                  {field.day}
                                </label>
                              </div>
                            )}
                          />
                        </div>
                        <div className='col-span-3'>
                          <Input
                            {...register(`schedule.${index}.start_time`)}
                          />
                        </div>
                        <div className='col-span-1 text-center text-gray-500'>
                          to
                        </div>
                        <div className='col-span-3'>
                          <Input {...register(`schedule.${index}.end_time`)} />
                        </div>
                        <div className='col-span-2 text-center text-gray-600'>
                          {isNaN(calculatedHours)
                            ? '-'
                            : `${calculatedHours} hours`}
                        </div>
                      </div>

                      <div className='grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__WorkScheduleSelectionForm__Row-Break'>
                        <div className='col-span-2 text-gray-500'>Break</div>
                        <div className='col-span-2'>
                          <Input
                            {...register(
                              `schedule.${index}.break_duration_minutes`,
                            )}
                          />
                        </div>
                        <div className='col-span-2 text-gray-500'>minutes</div>
                        <div className='col-span-4'></div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>

            {Object.keys(formState.errors).length > 0 && (
              <p className='text-destructive text-sm mb-0'>
                Invalid time format (HH:mm)
              </p>
            )}

            <div className='flex gap-4 pt-4'>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type='button'
                onClick={handleSubmit(handleSubmitWorkingHours)}
              >
                Save Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const WorkScheduleFieldDefault = ({
  fieldData,
}: WorkScheduleComponentProps) => {
  const { defaultFormattedValue, currentSchedule, onSubmit } = fieldData;
  const { workHoursSummary, breakSummary, totalWorkHours } =
    defaultFormattedValue;

  return (
    <div className='flex flex-col gap-3 RemoteFlows__WorkScheduleField'>
      <p className='text-sm RemoteFlows__WorkScheduleField__Title'>
        Work hours
      </p>
      <div className='flex flex-col gap-1 RemoteFlows__WorkScheduleField__Summary'>
        <p
          className='text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__WorkHours'
          dangerouslySetInnerHTML={{ __html: workHoursSummary.join(', ') }}
        />
        <p className='text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__Break'>
          {breakSummary.join()}
        </p>
        <p className='text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__Total'>
          Total of <span>{totalWorkHours}</span> hours per week
        </p>
        <WorkScheduleSelectionForm
          defaultSchedule={currentSchedule}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
