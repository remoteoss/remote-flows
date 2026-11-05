import {
  WorkWeekScheduleConfig,
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

export function getWorkWeekScheduleError(
  schedule: WorkWeekScheduleValue,
  config: WorkWeekScheduleConfig,
) {
  const start = timeToMinutes(schedule.start_time);
  const end = timeToMinutes(schedule.end_time);
  const breakStart = timeToMinutes(schedule.lunch_start_time);
  const breakEnd = timeToMinutes(schedule.lunch_end_time);
  const minStart = timeToMinutes(config.minStartTime);
  const maxEnd = timeToMinutes(config.maxEndTime);

  if (start === null || end === null) {
    return 'Start and end time are required.';
  }
  if (end <= start) {
    return 'End time must be later than start time.';
  }
  if (minStart !== null && start < minStart) {
    return `Working hours cannot start before ${config.minStartTime}.`;
  }
  if (maxEnd !== null && end > maxEnd) {
    return `Working hours cannot end after ${config.maxEndTime}.`;
  }
  if (breakStart === null || breakEnd === null) {
    return 'Break start and end time are required.';
  }
  if (breakStart < start) {
    return 'The rest break must start at or after the working hours start time.';
  }
  if (breakEnd > end) {
    return 'The rest break must end at or before the working hours end time.';
  }
  if (breakEnd <= breakStart) {
    return 'Break end time must be later than break start time.';
  }
  if (
    config.minBreakMinutes &&
    breakEnd - breakStart < config.minBreakMinutes
  ) {
    return `The rest break must be at least ${config.minBreakMinutes} minutes.`;
  }
  return null;
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
