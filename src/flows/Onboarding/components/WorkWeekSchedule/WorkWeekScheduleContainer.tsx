import { useState } from 'react';
import {
  WorkWeekScheduleConfig,
  WorkWeekScheduleLabels,
  WorkWeekScheduleRenderProps,
  WorkWeekScheduleSaveResult,
  WorkWeekScheduleValue,
} from '@/src/flows/Onboarding/components/WorkWeekSchedule/types';
import {
  calculateWorkingHours,
  getWorkWeekScheduleError,
} from '@/src/flows/Onboarding/components/WorkWeekSchedule/utils';

type SchemaField = { name: string; label?: string };

type WorkWeekScheduleContainerProps = {
  label?: string;
  description?: string;
  fields?: SchemaField[];
  value?: WorkWeekScheduleValue;
  setValue: (value: WorkWeekScheduleValue) => void;
  workScheduleConfig?: WorkWeekScheduleConfig;
  'x-jsf-presentation'?: { workScheduleConfig?: WorkWeekScheduleConfig };
  render: (props: WorkWeekScheduleRenderProps) => React.ReactNode;
};

/**
 * Headless container for the `work_week_schedule` field: one start/end time
 * and one break for the whole week.
 */
export const WorkWeekScheduleContainer = ({
  label,
  description,
  fields,
  value,
  setValue,
  render,
  ...fieldProps
}: WorkWeekScheduleContainerProps) => {
  const config: WorkWeekScheduleConfig =
    fieldProps.workScheduleConfig ??
    fieldProps['x-jsf-presentation']?.workScheduleConfig ??
    {};
  const labelOf = (name: string, fallback: string) =>
    fields?.find((field) => field.name === name)?.label ?? fallback;
  const labels: WorkWeekScheduleLabels = {
    title: label ?? 'Weekly work schedule',
    description,
    startTime: labelOf('start_time', 'Start time'),
    endTime: labelOf('end_time', 'End time'),
    breakStartTime: labelOf('lunch_start_time', 'Break starts'),
    breakEndTime: labelOf('lunch_end_time', 'Break ends'),
    workingHours: labelOf('working_hours', 'Working hours'),
  };
  const subtract = config.subtractBreaksFromWorkHours ?? true;
  const saved: WorkWeekScheduleValue = value ?? {};
  const [draft, setDraft] = useState<WorkWeekScheduleValue>(saved);
  const [error, setError] = useState<string | null>(null);

  const workingHours = calculateWorkingHours(draft, subtract);

  const save = async (): Promise<WorkWeekScheduleSaveResult> => {
    const validationError = getWorkWeekScheduleError(draft, config);
    setError(validationError);
    if (validationError) {
      return { saved: false, reason: 'invalid_schedule' };
    }
    setValue({ ...draft, working_hours: workingHours });
    return { saved: true };
  };

  const isDefined = Boolean(saved.start_time && saved.end_time);

  return render({
    labels,
    config,
    savedScheduleError: isDefined
      ? getWorkWeekScheduleError(saved, config)
      : null,
    summary: {
      startTime: saved.start_time,
      endTime: saved.end_time,
      breakStartTime: saved.lunch_start_time,
      breakEndTime: saved.lunch_end_time,
      workingHours: saved.working_hours ?? 0,
      isDefined,
    },
    editBag: {
      state: { draft, workingHours, error },
      actions: {
        update: (field, fieldValue) => {
          setError(null);
          setDraft((current) => ({ ...current, [field]: fieldValue }));
        },
        reset: () => {
          setError(null);
          setDraft(saved);
        },
        save,
      },
    },
  });
};
