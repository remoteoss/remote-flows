/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSFField } from '@/src/types/remoteFlows';
import React, { useEffect, useState } from 'react';

import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
import { useFormFields } from '@/src/context';
import { Form, FormField } from '@/src/components/ui/form';
import { Components } from '@/src/types/remoteFlows';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';

import {
  buildWorkScheduleSummary,
  calculateHours,
  calculateTotalWorkHours,
  DailySchedule,
  DAYS_OF_THE_WEEK,
  getShortWeekday,
} from './workScheduleUtils';
import { CheckBoxField } from './CheckBoxField';
import { TextField } from './TextField';

type WorkScheduleFieldProps = JSFField & {
  name: string;
  default: DailySchedule[];
  onChange?: (value: any) => void;
  component?: Components['work-schedule'];
};

type WorkScheduleFormData = {
  schedule: DailySchedule[];
};

type WorkScheduleSelectionProps = {
  defaultSchedule: DailySchedule[];
  onSubmit: (data: WorkScheduleFormData['schedule']) => void;
};

function WorkScheduleSelectionForm({
  defaultSchedule,
  onSubmit,
}: WorkScheduleSelectionProps) {
  const [open, setOpen] = useState(false);

  const transformedSchedule = DAYS_OF_THE_WEEK.map((day) => {
    const existingSchedule = defaultSchedule.find(
      (schedule) =>
        schedule.day.toLowerCase() === getShortWeekday(day).toLowerCase(),
    );

    if (existingSchedule) {
      return {
        ...existingSchedule,
        day: getShortWeekday(day),
        checked: true,
      };
    }

    return {
      ...defaultSchedule[0],
      checked: false,
      day: getShortWeekday(day),
    };
  });

  const form = useForm<WorkScheduleFormData>({
    defaultValues: {
      schedule: transformedSchedule,
    },
  });

  const { handleSubmit, watch, reset, control } = form;

  const { fields } = useFieldArray({
    name: 'schedule',
    control,
  });

  const watchedSchedule = watch('schedule');

  function handleSubmitWorkingHours(data: WorkScheduleFormData) {
    const schedule = data.schedule
      .filter(({ checked }) => checked)
      .map((day) => ({
        ...day,
        hours: calculateHours(day),
      }));

    onSubmit(schedule);
    setOpen(false);
  }

  function handleCancel() {
    reset();
    setOpen(false);
  }

  return (
    <div className="flex items-center justify-between">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={'link'} className="flex items-center p-0">
            Edit Schedule
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-8">
          <DialogHeader>
            <DialogTitle>Edit employee working hours</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-6">
              <div className="rounded-lg">
                <p className="text-gray-600 text-sm mb-4">
                  The times displayed are in the employee's time zone in the
                  24-hour format.
                </p>

                <div className="grid grid-cols-12 gap-4 mb-6 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-2"></div>
                  <div className="col-span-3 text-center">START</div>
                  <div className="col-span-1 text-center"></div>
                  <div className="col-span-3 text-center">END</div>
                  <div className="col-span-2 text-center">HOURS</div>
                  {/* <div className="col-span-2 text-center">ACTIONS</div> */}
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const currentDay = watchedSchedule[index];
                    const calculatedHours = calculateHours(currentDay);

                    return (
                      <div key={field.id}>
                        <div className="grid grid-cols-12 gap-4 items-center py-2">
                          <div className="col-span-2 flex items-center gap-3">
                            <CheckBoxField
                              label={field.day}
                              name={`schedule.${index}.checked`}
                            />
                          </div>
                          <div className="col-span-3">
                            <TextField name={`schedule.${index}.start_time`} />
                          </div>
                          <div className="col-span-1 text-center text-gray-500">
                            to
                          </div>
                          <div className="col-span-3">
                            <TextField name={`schedule.${index}.end_time`} />
                          </div>
                          <div className="col-span-2 text-center text-gray-600">
                            {`${calculatedHours} hours`}
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center py-2">
                          <div className="col-span-2 text-gray-500">Break</div>
                          <div className="col-span-2">
                            <TextField
                              name={`schedule.${index}.break_duration_minutes`}
                            />
                          </div>
                          <div className="col-span-2 text-gray-500">
                            minutes
                          </div>
                          <div className="col-span-4"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  className="reset-button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="submit-button"
                  onClick={handleSubmit(handleSubmitWorkingHours)}
                >
                  Save Schedule
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function WorkScheduleField(props: WorkScheduleFieldProps) {
  const { components } = useFormFields();
  const { setValue, control, watch } = useFormContext();
  const watchedSchedule = watch(props.name);
  const [currentSchedule, setCurrentSchedule] =
    useState<DailySchedule[]>(watchedSchedule);

  const { workHoursSummary, breakSummary } =
    buildWorkScheduleSummary(currentSchedule);
  const totalWorkHours = calculateTotalWorkHours(currentSchedule);

  useEffect(() => {
    setValue(props.name, currentSchedule);
  }, [currentSchedule, props.name, setValue]);

  function onSubmit(data: WorkScheduleFormData['schedule']) {
    setCurrentSchedule(data);
  }

  const CustomWorkScheduleField =
    props.component || components?.['work-schedule'];

  if (CustomWorkScheduleField) {
    return (
      <FormField
        control={control}
        name={props.name}
        render={({ field, fieldState }) => {
          return (
            <CustomWorkScheduleField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  props.onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={{
                ...props,
                // @ts-expect-error - defaultFormattedValue is not part of fieldData. It's generated in this component.
                defaultFormattedValue: {
                  workHoursSummary,
                  breakSummary,
                  totalWorkHours,
                },
              }}
            />
          );
        }}
      />
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 RemoteFlows__WorkScheduleField__${props.name}`}
    >
      <p className={`text-sm RemoteFlows__WorkScheduleField__Title`}>
        Work hours
      </p>
      <div className="flex flex-col gap-1 RemoteFlows__WorkScheduleField__Summary">
        <p className="text-sm text-gray-500">{workHoursSummary.join(', ')}</p>
        <p className="text-sm text-gray-500">{breakSummary.join()}</p>
        <p className="text-sm text-gray-500">
          Total of {totalWorkHours} hours per week
        </p>
        <WorkScheduleSelectionForm
          defaultSchedule={currentSchedule}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
