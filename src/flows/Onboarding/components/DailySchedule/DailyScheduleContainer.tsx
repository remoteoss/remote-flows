import { useFormContext } from 'react-hook-form';
import { DailyScheduleContainerProps } from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  calculateTotalWeeklyHours,
  getDailyScheduleHoursError,
  getDailyScheduleSummaryDays,
  getDefaultsFromSchema,
  getWorkHoursBounds,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { useDailyScheduleEditForm } from '@/src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm';

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

  const formBag = useDailyScheduleEditForm({
    availableWorkDays: defaults.availableWorkDays,
    defaultSchedule: defaults.defaultSchedule,
    defaultStartTime: defaults.defaultStartTime,
    defaultEndTime: defaults.defaultEndTime,
    defaultBreakDurationMinutes: defaults.defaultBreakDurationMinutes,
    subtractBreaksFromWorkHours: defaults.subtractBreaksFromWorkHours,
    workHoursBounds,
    workSchedule: resolvedWorkSchedule,
    countryName: defaults.countryName,
    value,
    setValue: fieldProps.setValue,
  });

  return render({
    summaryDays,
    subtractBreaksFromWorkHours: defaults.subtractBreaksFromWorkHours,
    hoursError,
    formBag,
  });
};
