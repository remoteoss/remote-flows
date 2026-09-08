import {
  DailyScheduleDefaultDay,
  DailyScheduleDefaults,
  DailyScheduleMetadata,
  DailyScheduleValue,
  WorkHoursBoundsInput,
  WorkHoursPerWeekConfig,
  WorkHoursRange,
  Weekday,
} from '@/src/flows/Onboarding/components/DailySchedule/types';

/**
 * Ported from Dragon's WorkScheduleField utils (employ-starbase:
 * apps/employ/src/components/Ui/Form/WorkScheduleField/utils/schedule.js and
 * .../utils/time.js), reference MR
 * gitlab.com/remote-com/employ-starbase/dragon/-/merge_requests/49203.
 */

export const DAYS_OF_THE_WEEK: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const MINUTES_IN_HOUR = 60;

const SCHEDULE_TYPE_BUSINESS_HOURS = 'core_business_hours';
const WORK_SCHEDULE_FULL_TIME = 'full_time';
const WORK_SCHEDULE_PART_TIME = 'part_time';

export function convertTimeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10));

  return hours * MINUTES_IN_HOUR + minutes;
}

export function convertMinutesToHours(timeInMinutes: number): number {
  const totalHours = timeInMinutes / MINUTES_IN_HOUR;
  const decimals = totalHours.toString().split('.')[1];

  if (!decimals || decimals.length <= 2) {
    return totalHours;
  }

  // Aligns with json-schema-form's own rounding behavior (2 decimal places max).
  return Math.floor(totalHours * 100) / 100;
}

/** Total working hours for a day, given its start/end time and break duration. */
export function calculateWorkingHours(
  startTime: string | undefined,
  endTime: string | undefined,
  breakDurationMinutes?: number | null,
): number {
  if (!startTime || !endTime) {
    return 0;
  }

  const startTimeInMinutes = convertTimeStringToMinutes(startTime);
  const endTimeInMinutes = convertTimeStringToMinutes(endTime);
  const totalTimeInMinutes =
    endTimeInMinutes - startTimeInMinutes - (breakDurationMinutes || 0);

  if (totalTimeInMinutes < 0) {
    return 0;
  }

  return convertMinutesToHours(totalTimeInMinutes);
}

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

/**
 * The schedule to display/edit: the field's saved `value` when present,
 * otherwise a schedule built from the metadata's `default_schedule` — so the
 * summary and the edit modal show sensible defaults before the employer has
 * saved anything (create flow), not just after (edit flow).
 */
export function resolveDailyScheduleValue({
  value,
  defaultSchedule,
}: {
  value: DailyScheduleValue | undefined;
  defaultSchedule: DailyScheduleDefaultDay[];
}): DailyScheduleValue {
  if (value) {
    return value;
  }

  return {
    selected_days: defaultSchedule.map((day) => day.day),
    schedule: defaultSchedule.reduce(
      (acc, day) => ({
        ...acc,
        [day.day]: {
          start_time: day.start_time,
          end_time: day.end_time,
          break_duration_minutes: day.break_duration_minutes,
        },
      }),
      {},
    ),
  };
}
