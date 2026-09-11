import { useFormContext } from 'react-hook-form';
import { DailyScheduleContainerProps } from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  calculateTotalWeeklyHours,
  getDailyScheduleHoursError,
  getDailyScheduleSummaryDays,
  getDefaultsFromSchema,
  getWorkHoursBounds,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';

/**
 * Headless container for the `daily_schedule`, following the pattern of the
 * `PaidTimeOffContainer`: owns schema-metadata derivation and calls `render`
 * with the computed payload.
 *
 */
export const DailyScheduleContainer = ({
  render,
  metadata,
  value,
  ...fieldProps
}: DailyScheduleContainerProps) => {
  const { watch } = useFormContext();
  const watchedScheduleType = watch('schedule_type');
  const watchedWorkSchedule = watch('work_schedule');
  const resolvedWorkSchedule = watchedWorkSchedule;

  const defaults = getDefaultsFromSchema(metadata);
  const workHoursBounds = getWorkHoursBounds(defaults.workHoursPerWeekConfig, {
    scheduleType: watchedScheduleType,
    workSchedule: watchedWorkSchedule,
  });

  const summaryDays = getDailyScheduleSummaryDays(
    value,
    defaults.defaultSchedule,
  );
  const totalWeeklyHours = calculateTotalWeeklyHours(
    summaryDays,
    defaults.subtractBreaksFromWorkHours,
  );
  const hoursError = getDailyScheduleHoursError({
    totalWeeklyHours,
    workHoursBounds,
    countryName: defaults.countryName,
    workSchedule: resolvedWorkSchedule,
  });

  return render({
    ...fieldProps,
    value,
    ...defaults,
    metadata,
    workHoursBounds,
    workSchedule: resolvedWorkSchedule,
    summaryDays,
    totalWeeklyHours,
    hoursError,
  });
};
