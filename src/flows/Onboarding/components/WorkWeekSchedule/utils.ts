import {
  WorkWeekScheduleConfig,
  WorkWeekScheduleSummary,
  WorkWeekScheduleSummaryLine,
  WorkWeekScheduleValue,
} from '@/src/flows/Onboarding/components/WorkWeekSchedule/types';

const MINUTES_IN_HOUR = 60;
const FULL_TIME_WORK_DAYS = 5;

export function timeToMinutes(time?: string) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * MINUTES_IN_HOUR + minutes;
}

export function calculateWorkingHours(
  schedule: WorkWeekScheduleValue,
  subtractBreaksFromWorkHours = true,
) {
  const start = timeToMinutes(schedule.start_time);
  const end = timeToMinutes(schedule.end_time);
  if (start === null || end === null || end <= start) {
    return 0;
  }
  const breakStart = timeToMinutes(schedule.lunch_start_time);
  const breakEnd = timeToMinutes(schedule.lunch_end_time);
  const breakMinutes =
    subtractBreaksFromWorkHours &&
    breakStart !== null &&
    breakEnd !== null &&
    breakEnd > breakStart
      ? breakEnd - breakStart
      : 0;
  return Number(((end - start - breakMinutes) / MINUTES_IN_HOUR).toFixed(2));
}

export const WORK_WEEK_SCHEDULE_TIME_FIELDS = [
  'start_time',
  'end_time',
  'lunch_start_time',
  'lunch_end_time',
] as const;

export type WorkWeekScheduleTimeField =
  (typeof WORK_WEEK_SCHEDULE_TIME_FIELDS)[number];

export type WorkWeekScheduleFieldErrors = Partial<
  Record<WorkWeekScheduleTimeField, string>
>;

/**
 * Validates a schedule against the schema bounds and returns one message per
 * time field that is wrong.
 */
export function getWorkWeekScheduleFieldErrors(
  schedule: WorkWeekScheduleValue,
  config: WorkWeekScheduleConfig,
): WorkWeekScheduleFieldErrors {
  const errors: WorkWeekScheduleFieldErrors = {};
  const start = timeToMinutes(schedule.start_time);
  const end = timeToMinutes(schedule.end_time);
  const breakStart = timeToMinutes(schedule.lunch_start_time);
  const breakEnd = timeToMinutes(schedule.lunch_end_time);
  const minStart = timeToMinutes(config.minStartTime);
  const maxEnd = timeToMinutes(config.maxEndTime);

  if (start === null) {
    errors.start_time = 'Start time is required.';
  } else if (minStart !== null && start < minStart) {
    errors.start_time = `Working hours cannot start before ${config.minStartTime}.`;
  }

  if (end === null) {
    errors.end_time = 'End time is required.';
  } else if (start !== null && end <= start) {
    errors.end_time = 'End time must be later than start time.';
  } else if (maxEnd !== null && end > maxEnd) {
    errors.end_time = `Working hours cannot end after ${config.maxEndTime}.`;
  }

  if (breakStart === null) {
    errors.lunch_start_time = 'Break start time is required.';
  } else if (start !== null && breakStart < start) {
    errors.lunch_start_time =
      'The rest break must start at or after the working hours start time.';
  }

  if (breakEnd === null) {
    errors.lunch_end_time = 'Break end time is required.';
  } else if (end !== null && breakEnd > end) {
    errors.lunch_end_time =
      'The rest break must end at or before the working hours end time.';
  } else if (breakStart !== null && breakEnd <= breakStart) {
    errors.lunch_end_time =
      'Break end time must be later than break start time.';
  } else if (
    breakStart !== null &&
    config.minBreakMinutes &&
    breakEnd - breakStart < config.minBreakMinutes
  ) {
    errors.lunch_end_time = `The rest break must be at least ${config.minBreakMinutes} minutes.`;
  }

  return errors;
}

/** The first validation error of a schedule, or null when it is valid. */
export function getWorkWeekScheduleError(
  schedule: WorkWeekScheduleValue,
  config: WorkWeekScheduleConfig,
) {
  const errors = getWorkWeekScheduleFieldErrors(schedule, config);
  const firstField = WORK_WEEK_SCHEDULE_TIME_FIELDS.find(
    (field) => errors[field],
  );
  return firstField ? (errors[firstField] ?? null) : null;
}

export function calculateWeeklyHours({
  workingHours,
  workSchedule,
  partTimeDays,
}: {
  workingHours: number;
  workSchedule?: string;
  partTimeDays?: string[];
}) {
  const days =
    workSchedule === 'part_time'
      ? (partTimeDays?.length ?? 0)
      : FULL_TIME_WORK_DAYS;
  return Number((days * workingHours).toFixed(2));
}

/**
 * Turns a saved schedule into display lines, so a custom UI can reuse the
 * default wording without its markup.
 */
export function buildWorkWeekScheduleSummary(
  summary: WorkWeekScheduleSummary,
): WorkWeekScheduleSummaryLine[] {
  if (!summary.isDefined) {
    return [];
  }
  return [
    {
      key: 'hours',
      segments: [
        { text: 'From ' },
        { text: summary.startTime ?? '', bold: true },
        { text: ' to ' },
        { text: summary.endTime ?? '', bold: true },
      ],
    },
    {
      key: 'break',
      segments: [
        { text: 'Break from ' },
        { text: summary.breakStartTime ?? '', bold: true },
        { text: ' to ' },
        { text: summary.breakEndTime ?? '', bold: true },
      ],
    },
    {
      key: 'total',
      segments: [
        { text: `${summary.workingHours} hours`, bold: true },
        { text: ' per day' },
      ],
    },
  ];
}
