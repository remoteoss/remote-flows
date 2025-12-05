/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { JSFField } from '@/src/types/remoteFlows';
import { useFormFields } from '@/src/context';
import { FormField } from '@/src/components/ui/form';
import { Components } from '@/src/types/remoteFlows';

import {
  buildWorkScheduleSummary,
  calculateTotalWorkHours,
  DailySchedule,
} from './workScheduleUtils';
import { WorkScheduleFieldDefault } from '@/src/components/form/fields/default/WorkScheduleFieldDefault';

type WorkScheduleFieldProps = JSFField & {
  name: string;
  default: DailySchedule[];
  onChange?: (value: any) => void;
  component?: Components['work-schedule'];
};

type WorkScheduleFormData = {
  schedule: DailySchedule[];
};

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
  const Component = CustomWorkScheduleField || WorkScheduleFieldDefault;

  const fieldData = {
    ...props,
    onSubmit,
    currentSchedule,
    defaultFormattedValue: {
      workHoursSummary,
      breakSummary,
      totalWorkHours,
    },
  };

  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field, fieldState }) => {
        return (
          <Component
            field={{
              ...field,
              onChange: (value: any) => {
                field.onChange(value);
                props.onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={fieldData}
          />
        );
      }}
    />
  );
}
