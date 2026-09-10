// Code comes from our platform codebase, go there to see the original source

import {
  DailyScheduleDefaults,
  DailyScheduleMetadata,
  Weekday,
  WorkHoursBoundsInput,
  WorkHoursPerWeekConfig,
  WorkHoursRange,
} from '@/src/flows/Onboarding/components/DailySchedule/types';

export const DAYS_OF_THE_WEEK: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Normalizes the raw `daily_schedule['x-jsf-presentation'].metadata` block
 * into the camelCase shape the container/render-prop payload uses.
 */
export function getDefaultsFromSchema(
  metadata: DailyScheduleMetadata,
): DailyScheduleDefaults {
  const {
    subtract_breaks_in_work_hours: subtractBreaksFromWorkHours,
    country_name: countryName,
    default_start_time: defaultStartTime,
    default_end_time: defaultEndTime,
    default_break_duration_minutes: defaultBreakDurationMinutes,
    default_schedule: defaultSchedule,
    work_hours_per_week: workHoursPerWeekConfig,
    work_days: availableWorkDays = DAYS_OF_THE_WEEK,
  } = metadata;

  return {
    subtractBreaksFromWorkHours,
    countryName,
    defaultStartTime,
    defaultEndTime,
    defaultBreakDurationMinutes,
    defaultSchedule,
    workHoursPerWeekConfig,
    availableWorkDays,
  };
}

const SCHEDULE_TYPE_BUSINESS_HOURS = 'core_business_hours';
const WORK_SCHEDULE_FULL_TIME = 'full_time';
const WORK_SCHEDULE_PART_TIME = 'part_time';

/**
 * Resolves the allowed weekly-hours range for the current `schedule_type`/
 * `work_schedule` selection. For core business hours, the minimum drops to 1
 * because the real validation lives on the `work_hours_per_week` field itself.
 */
export function getWorkHoursBounds(
  workHoursPerWeekConfig: WorkHoursPerWeekConfig,
  { scheduleType, workSchedule }: WorkHoursBoundsInput,
): WorkHoursRange {
  const minimumOverride =
    scheduleType === SCHEDULE_TYPE_BUSINESS_HOURS ? 1 : undefined;

  if (workSchedule === WORK_SCHEDULE_FULL_TIME) {
    return {
      minimum: minimumOverride ?? workHoursPerWeekConfig.full_time.minimum,
      maximum: workHoursPerWeekConfig.full_time.maximum,
    };
  }

  if (workSchedule === WORK_SCHEDULE_PART_TIME) {
    return {
      minimum: minimumOverride ?? workHoursPerWeekConfig.part_time.minimum,
      maximum: workHoursPerWeekConfig.part_time.maximum,
    };
  }

  return {
    minimum: minimumOverride ?? workHoursPerWeekConfig.baseline.minimum,
    maximum: workHoursPerWeekConfig.baseline.maximum,
  };
}
