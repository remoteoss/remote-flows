/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';

import { JSFField } from '@/src/types/remoteFlows';
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

const fieldSchema = yup.object({
  day: yup.string().required(),
  checked: yup.boolean().required(),
  start_time: yup
    .string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
    .when('checked', {
      is: true,
      then: (schema) => schema.required('Required'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  end_time: yup
    .string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
    .when('checked', {
      is: true,
      then: (schema) => schema.required('Required'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  hours: yup.number().default(0),
  break_duration_minutes: yup.string().default('0'),
});

const formSchema = yup.object({
  schedule: yup.array(fieldSchema),
});

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
      return {
        ...existingSchedule,
        day: getShortWeekday(day),
        checked: true,
      };
    }

    return {
      // We just need to override the day and checked. The rest of the fields are the same for every day.
      ...defaultSchedule[0],
      checked: false,
      day: getShortWeekday(day),
    };
  });

  const form = useForm<WorkScheduleFormData>({
    defaultValues: {
      schedule: transformedSchedule,
    },
    resolver: yupResolver(formSchema) as any,
  });

  const { handleSubmit, watch, reset, control, formState } = form;

  const { fields } = useFieldArray({
    name: 'schedule',
    control,
  });

  const watchedSchedule = watch('schedule');

  function handleSubmitWorkingHours(data: WorkScheduleFormData) {
    // We can only send the days that are checked.
    const schedule = data.schedule
      .filter(({ checked }) => checked)
      .map((day) => ({
        ...day,
        hours: calculateHours(day),
      }));

    onSubmit(schedule);
    setOpenDialog(false);
  }

  function handleCancel() {
    reset();
    setOpenDialog(false);
  }

  return (
    <div className="flex items-center justify-between">
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button
            variant={'link'}
            className="flex items-center p-0 RemoteFlows__WorkScheduleSelectionForm__Trigger"
          >
            Edit Schedule
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-4 RemoteFlows__WorkScheduleSelectionForm__Content">
          <DialogHeader>
            <DialogTitle className="RemoteFlows__WorkScheduleSelectionForm__Title">
              Edit employee working hours
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4 RemoteFlows__WorkScheduleSelectionForm__Form">
              <div className="rounded-lg">
                <p className="text-gray-600 text-sm mb-4 RemoteFlows__WorkScheduleSelectionForm__Description">
                  The times displayed are in the employee's time zone in the
                  24-hour format.
                </p>

                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide RemoteFlows__WorkScheduleSelectionForm__Header">
                  <div className="col-span-2"></div>
                  <div className="col-span-3 text-center">START</div>
                  <div className="col-span-1 text-center"></div>
                  <div className="col-span-3 text-center">END</div>
                  <div className="col-span-2 text-center">HOURS</div>
                  {/* <div className="col-span-2 text-center">ACTIONS</div> */}
                </div>

                <div className="RemoteFlows__WorkScheduleSelectionForm__Rows">
                  {fields.map((field, index) => {
                    const currentDay = watchedSchedule[index];
                    const calculatedHours = calculateHours(currentDay);

                    return (
                      <React.Fragment key={field.id}>
                        <div className="grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__WorkScheduleSelectionForm__Row-Hours">
                          <div className="col-span-2 flex items-center gap-3">
                            <CheckBoxField
                              label={field.day}
                              name={`schedule.${index}.checked`}
                            />
                          </div>
                          <div className="col-span-3">
                            <TextField
                              name={`schedule.${index}.start_time`}
                              includeErrorMessage={false}
                            />
                          </div>
                          <div className="col-span-1 text-center text-gray-500">
                            to
                          </div>
                          <div className="col-span-3">
                            <TextField
                              name={`schedule.${index}.end_time`}
                              includeErrorMessage={false}
                            />
                          </div>
                          <div className="col-span-2 text-center text-gray-600">
                            {isNaN(calculatedHours)
                              ? '-'
                              : `${calculatedHours} hours`}
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center py-2 RemoteFlows__WorkScheduleSelectionForm__Row-Break">
                          <div className="col-span-2 text-gray-500">Break</div>
                          <div className="col-span-2">
                            <TextField
                              name={`schedule.${index}.break_duration_minutes`}
                              includeErrorMessage={false}
                            />
                          </div>
                          <div className="col-span-2 text-gray-500">
                            minutes
                          </div>
                          <div className="col-span-4"></div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {Object.keys(formState.errors).length > 0 && (
                <p className="text-destructive text-sm mb-0">
                  Invalid time format (HH:mm)
                </p>
              )}

              <div className="flex gap-4 pt-4">
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
    <div className={`flex flex-col gap-3 RemoteFlows__WorkScheduleField`}>
      <p className={`text-sm RemoteFlows__WorkScheduleField__Title`}>
        Work hours
      </p>
      <div className="flex flex-col gap-1 RemoteFlows__WorkScheduleField__Summary">
        <p
          className="text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__WorkHours"
          dangerouslySetInnerHTML={{
            __html: workHoursSummary.join(', '),
          }}
        />

        <p className="text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__Break">
          {breakSummary.join()}
        </p>
        <p className="text-sm text-gray-500 RemoteFlows__WorkScheduleField__Summary__Total">
          Total of <span>{totalWorkHours}</span> hours per week
        </p>
        <WorkScheduleSelectionForm
          defaultSchedule={currentSchedule}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
