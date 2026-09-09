import groupBy from 'lodash.groupby';

import { getSingularPluralUnit } from '@/src/lib/i18n';
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

export type DailyScheduleHoursError = {
  header: string;
  message: string;
};

function workScheduleCopy(workSchedule: string | undefined): string {
  if (workSchedule === WORK_SCHEDULE_FULL_TIME) {
    return 'a full-time employee';
  }

  if (workSchedule === WORK_SCHEDULE_PART_TIME) {
    return 'a part-time employee';
  }

  return 'an employee';
}

/**
 * Ported from Dragon's `DailyScheduleError.jsx`: flags a schedule whose total
 * weekly hours fall outside the country/work-schedule's allowed range, e.g.
 * "Work hours outside of weekly range - The work week for a full-time
 * employee in Germany is between 31 and 48 hours."
 */
export function getDailyScheduleHoursError({
  totalWeeklyHours,
  workHoursBounds,
  countryName,
  workSchedule,
}: {
  totalWeeklyHours: number;
  workHoursBounds: WorkHoursRange;
  countryName: string;
  workSchedule: string | undefined;
}): DailyScheduleHoursError | null {
  if (totalWeeklyHours === 0) {
    return null;
  }

  const { minimum, maximum } = workHoursBounds;

  if (totalWeeklyHours >= minimum && totalWeeklyHours <= maximum) {
    return null;
  }

  const maxHoursCopy = getSingularPluralUnit({
    number: maximum,
    singular: 'hour',
    plural: 'hours',
    followCopyGuidelines: false,
  });
  const rangeCopy =
    minimum === maximum
      ? maxHoursCopy
      : `between ${minimum} and ${maxHoursCopy}`;

  return {
    header: 'Work hours outside of weekly range',
    message: `The work week for ${workScheduleCopy(workSchedule)} in ${countryName} is ${rangeCopy}.`,
  };
}

/**
 * A selected day's schedule, in the shape the summary builder groups on —
 * both the read-only summary (from `DailyScheduleValue.schedule`) and the
 * edit modal's live preview (from `watchedSchedule`) normalize to this.
 */
export type DailyScheduleSummaryDay = {
  day: Weekday;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
};

export type DailyScheduleSummarySegment = { text: string; bold?: boolean };

export type DailyScheduleSummaryLine = {
  key: string;
  segments: DailyScheduleSummarySegment[];
};

function capitalizeDay(day: Weekday): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

/** Dragon's display format for a HH:mm time, e.g. "09:00" -> "09h00". */
function formatTimeLabel(time: string): string {
  return time.replace(':', 'h');
}

function formatBreakDurationLabel(minutes: number): string {
  if (minutes < MINUTES_IN_HOUR) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const remainingMinutes = minutes % MINUTES_IN_HOUR;

  return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
}

/**
 * The last day, starting from `startDay`, in an unbroken run of consecutive
 * weekdays within `days` — used to collapse e.g. Monday-Friday into a single
 * "Monday to Friday" range instead of five separate lines.
 */
function findLastConsecutiveDay(
  startDay: Weekday,
  days: Weekday[],
): Weekday | null {
  let index = days.indexOf(startDay);
  let lastConsecutiveDay: Weekday | null = null;

  while (index < days.length && !lastConsecutiveDay) {
    const currentDay = days[index];
    const nextDay = days[index + 1];
    const nextDayInWeek =
      DAYS_OF_THE_WEEK[DAYS_OF_THE_WEEK.indexOf(currentDay) + 1];

    if (nextDayInWeek !== nextDay) {
      lastConsecutiveDay = currentDay;
    }

    index += 1;
  }

  return lastConsecutiveDay;
}

/** "Monday" / "Monday and Tuesday" / "Monday, Tuesday and Wednesday", each day bold. */
function boldDayListSegments(days: Weekday[]): DailyScheduleSummarySegment[] {
  return days.flatMap((day, index) => {
    const dayLabel: DailyScheduleSummarySegment = {
      text: capitalizeDay(day),
      bold: true,
    };

    if (index === 0) {
      return [dayLabel];
    }

    const joiner = index === days.length - 1 ? ' and ' : ', ';
    return [{ text: joiner }, dayLabel];
  });
}

/** "Monday" / "Monday and Tuesday" / "Monday, Tuesday and Wednesday" (plain text). */
function formatDayListText(days: Weekday[]): string {
  const names = days.map(capitalizeDay);

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function buildWorkHoursLine(
  timeKey: string,
  daysInGroup: DailyScheduleSummaryDay[],
): DailyScheduleSummaryLine {
  const [startTime, endTime] = timeKey.split('|');
  const dayNames = daysInGroup.map((day) => day.day);
  const startDay = dayNames[0];
  const lastConsecutiveDay = findLastConsecutiveDay(startDay, dayNames);
  const allDaysAreConsecutive =
    lastConsecutiveDay !== null &&
    dayNames.indexOf(lastConsecutiveDay) === dayNames.length - 1;

  const timeSegments: DailyScheduleSummarySegment[] = [
    { text: 'from ' },
    { text: formatTimeLabel(startTime), bold: true },
    { text: ' to ' },
    { text: formatTimeLabel(endTime), bold: true },
  ];

  if (dayNames.length === 1) {
    return {
      key: timeKey,
      segments: [
        { text: capitalizeDay(startDay), bold: true },
        { text: ', ' },
        ...timeSegments,
      ],
    };
  }

  if (allDaysAreConsecutive) {
    return {
      key: timeKey,
      segments: [
        { text: capitalizeDay(startDay), bold: true },
        { text: ' to ' },
        { text: capitalizeDay(lastConsecutiveDay), bold: true },
        { text: ', ' },
        ...timeSegments,
      ],
    };
  }

  return {
    key: timeKey,
    segments: [
      ...boldDayListSegments(dayNames),
      { text: ', ' },
      ...timeSegments,
    ],
  };
}

function buildBreakLine(
  breakDurationMinutes: string,
  daysInGroup: DailyScheduleSummaryDay[],
  isOnlyGroup: boolean,
): DailyScheduleSummaryLine {
  const breakLabel = formatBreakDurationLabel(Number(breakDurationMinutes));

  if (isOnlyGroup) {
    return {
      key: breakDurationMinutes,
      segments: [
        { text: 'With ' },
        { text: `${breakLabel} daily breaks`, bold: true },
      ],
    };
  }

  const dayListText = formatDayListText(daysInGroup.map((day) => day.day));

  return {
    key: breakDurationMinutes,
    segments: [
      { text: 'With ' },
      { text: breakLabel, bold: true },
      { text: ` break on ${dayListText}.` },
    ],
  };
}

/**
 * Groups a schedule's selected days into Dragon-style summary lines: runs of
 * consecutive days sharing the same start/end time collapse into one line
 * (e.g. "Monday to Friday, from 09h00 to 18h00"), and likewise for shared
 * break durations (e.g. "With 1h daily breaks").
 */
export function buildDailyScheduleSummary(
  days: DailyScheduleSummaryDay[],
  subtractBreaksFromWorkHours: boolean,
): {
  workHoursLines: DailyScheduleSummaryLine[];
  breakLines: DailyScheduleSummaryLine[];
  totalWeeklyHours: number;
} {
  const orderedDays = [...days].sort(
    (a, b) =>
      DAYS_OF_THE_WEEK.indexOf(a.day) - DAYS_OF_THE_WEEK.indexOf(b.day),
  );

  const totalWeeklyHours = orderedDays.reduce(
    (total, day) =>
      total +
      calculateWorkingHours(
        day.start_time,
        day.end_time,
        subtractBreaksFromWorkHours ? day.break_duration_minutes : 0,
      ),
    0,
  );

  const groupedByTime = groupBy(
    orderedDays,
    (day) => `${day.start_time}|${day.end_time}`,
  );
  const workHoursLines = Object.entries(groupedByTime).map(
    ([timeKey, daysInGroup]) => buildWorkHoursLine(timeKey, daysInGroup),
  );

  const daysWithBreaks = orderedDays.filter(
    (day) => day.break_duration_minutes > 0,
  );
  const groupedByBreak = groupBy(daysWithBreaks, (day) =>
    String(day.break_duration_minutes),
  );
  // Object.entries would reorder purely-numeric keys ("30", "60", ...)
  // ascending numerically regardless of insertion order, so walk the
  // group keys in the order their first day appears instead.
  const breakDurationKeysInOrder = [
    ...new Set(daysWithBreaks.map((day) => String(day.break_duration_minutes))),
  ];
  const breakLines = breakDurationKeysInOrder.map((breakDurationMinutes) =>
    buildBreakLine(
      breakDurationMinutes,
      groupedByBreak[breakDurationMinutes],
      breakDurationKeysInOrder.length === 1,
    ),
  );

  return { workHoursLines, breakLines, totalWeeklyHours };
}
