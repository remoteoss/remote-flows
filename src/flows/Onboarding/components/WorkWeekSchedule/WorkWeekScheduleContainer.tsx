import { useState } from 'react';
import {
  WorkWeekScheduleConfig,
  WorkWeekScheduleRenderProps,
  WorkWeekScheduleValue,
} from '@/src/flows/Onboarding/components/WorkWeekSchedule/types';
import {
  calculateWorkingHours,
  getWorkWeekScheduleError,
} from '@/src/flows/Onboarding/components/WorkWeekSchedule/utils';

type WorkWeekScheduleContainerProps = {
  label: string;
  description?: string;
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
  value,
  setValue,
  render,
  ...fieldProps
}: WorkWeekScheduleContainerProps) => {
  const config: WorkWeekScheduleConfig =
    fieldProps.workScheduleConfig ??
    fieldProps['x-jsf-presentation']?.workScheduleConfig ??
    {};
  const subtract = config.subtractBreaksFromWorkHours ?? true;
  const saved: WorkWeekScheduleValue = value ?? {};
  const [draft, setDraft] = useState<WorkWeekScheduleValue>(saved);
  const [error, setError] = useState<string | null>(null);

  const workingHours = calculateWorkingHours(draft, subtract);

  const save = () => {
    const validationError = getWorkWeekScheduleError(draft, config);
    setError(validationError);
    if (validationError) {
      return false;
    }
    setValue({ ...draft, working_hours: workingHours });
    return true;
  };

  return render({
    label,
    description,
    config,
    summary: {
      startTime: saved.start_time,
      endTime: saved.end_time,
      breakStartTime: saved.lunch_start_time,
      breakEndTime: saved.lunch_end_time,
      workingHours: saved.working_hours ?? 0,
      isDefined: Boolean(saved.start_time && saved.end_time),
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
