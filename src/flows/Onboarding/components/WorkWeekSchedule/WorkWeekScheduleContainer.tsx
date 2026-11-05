import { useState } from 'react';
import {
  WorkWeekScheduleConfig,
  WorkWeekScheduleLabels,
  WorkWeekScheduleRenderProps,
  WorkWeekScheduleSaveResult,
  WorkWeekScheduleSummary,
  WorkWeekScheduleValue,
} from '@/src/flows/Onboarding/components/WorkWeekSchedule/types';
import {
  calculateWorkingHours,
  getWorkWeekScheduleError,
  getWorkWeekScheduleFieldErrors,
  WORK_WEEK_SCHEDULE_TIME_FIELDS,
  WorkWeekScheduleTimeField,
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

const toSummary = (
  schedule: WorkWeekScheduleValue,
  workingHours: number,
): WorkWeekScheduleSummary => ({
  startTime: schedule.start_time,
  endTime: schedule.end_time,
  breakStartTime: schedule.lunch_start_time,
  breakEndTime: schedule.lunch_end_time,
  workingHours,
  isDefined: Boolean(schedule.start_time && schedule.end_time),
});

const isSameSchedule = (a: WorkWeekScheduleValue, b: WorkWeekScheduleValue) =>
  WORK_WEEK_SCHEDULE_TIME_FIELDS.every(
    (field) => (a[field] ?? '') === (b[field] ?? ''),
  );

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
  const [touched, setTouched] = useState<WorkWeekScheduleTimeField[]>([]);
  const [saveAttempted, setSaveAttempted] = useState(false);

  const workingHours = calculateWorkingHours(draft, subtract);
  const fieldErrors = getWorkWeekScheduleFieldErrors(draft, config);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const save = async (): Promise<WorkWeekScheduleSaveResult> => {
    setSaveAttempted(true);
    if (hasFieldErrors) {
      return { saved: false, reason: 'invalid_schedule' };
    }
    setValue({ ...draft, working_hours: workingHours });
    setSaveAttempted(false);
    setTouched([]);
    return { saved: true };
  };

  const close = () => {
    setDraft(saved);
    setTouched([]);
    setSaveAttempted(false);
  };

  const isDefined = Boolean(saved.start_time && saved.end_time);

  return render({
    labels,
    config,
    savedScheduleError: isDefined
      ? getWorkWeekScheduleError(saved, config)
      : null,
    summary: toSummary(saved, saved.working_hours ?? 0),
    editBag: {
      state: {
        draft,
        workingHours,
        unsavedSummary: toSummary(draft, workingHours),
        hasUnsavedChanges: !isSameSchedule(draft, saved),
        error: saveAttempted ? getWorkWeekScheduleError(draft, config) : null,
        hasFieldErrors,
        getFieldError: (field) =>
          saveAttempted || touched.includes(field)
            ? fieldErrors[field]
            : undefined,
      },
      actions: {
        update: (field, fieldValue) => {
          setDraft((current) => ({ ...current, [field]: fieldValue }));
        },
        handleBlur: (field) => {
          setTouched((current) =>
            current.includes(field) ? current : [...current, field],
          );
        },
        save,
        close,
      },
    },
  });
};
