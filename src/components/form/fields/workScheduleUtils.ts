/* eslint-disable @typescript-eslint/no-explicit-any */
import groupBy from 'lodash/groupBy';
import capitalize from 'lodash/capitalize';

const MINUTES_IN_HOUR = 60;

export const DAYS_OF_THE_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DailySchedule = {
  day: string;
  start_time: string;
  end_time: string;
  hours: number | string;
  break_duration_minutes: string;
  checked?: boolean;
};

/**
 * Convert break duration in minutes to hours and minutes
 * @param breakDuration - Break duration in minutes
 * @returns Break duration in hours and minutes
 */
function convertBreakDurationToHours(breakDuration: number) {
  if (breakDuration < 60) {
    return `${breakDuration}m`;
  }

  const hours = Math.floor(breakDuration / MINUTES_IN_HOUR);
  const minutes = breakDuration % MINUTES_IN_HOUR;

  if (minutes > 0) {
    return `${hours}h${minutes}m`;
  }

  return `${hours}h`;
}

/**
 * Calculate total work hours from daily schedules
 * @param dailySchedules - Daily schedules
 * @returns Total work hours
 */
export function calculateTotalWorkHours(dailySchedules: any[]) {
  const totalWorkHours = dailySchedules.reduce((total, daySchedule) => {
    const sum = daySchedule.hours + total;
    return sum;
  }, 0);

  return Number(totalWorkHours.toFixed(2));
}

/**
 * Find the last consecutive day in a schedule (used to summarize work hours)
 * @param startDay - The starting day
 * @param dailySchedule - The daily schedule
 * @returns The last consecutive day
 */
function findLastConsecutiveDay(startDay: string, dailySchedule: any) {
  const daysScheduled = dailySchedule.map((daySchedule: any) =>
    daySchedule.day.toLowerCase(),
  );

  let idx = daysScheduled.indexOf(startDay);
  let day = null;

  while (idx < daysScheduled.length && !day) {
    const currentDay = daysScheduled[idx];
    const nextDay = daysScheduled[idx + 1];

    const nextDayIdx = DAYS_OF_THE_WEEK.indexOf(currentDay) + 1;
    const isNextDay = DAYS_OF_THE_WEEK[nextDayIdx] === nextDay;

    if (!isNextDay) {
      day = currentDay;
    }

    idx += 1;
  }

  return day;
}

/**
 * Check if a day schedule should be summarized
 * @param daySchedule - The day schedule
 * @returns True if the day schedule should be summarized
 */
function shouldSummarizeSchedule(daySchedule: any) {
  return (
    daySchedule.start_time && daySchedule.end_time && daySchedule.hours > 0
  );
}

/**
 * Check if break duration should be summarized
 * @param daySchedule - The day schedule
 * @returns True if the break duration should be summarized
 */
function shouldSummarizeBreaks(daySchedule: any) {
  return daySchedule.break_duration_minutes > 0;
}

/**
 * Build the work schedule summary
 * @param dailySchedules - The daily schedules
 * @returns The work schedule summary
 */
export function buildWorkScheduleSummary(dailySchedules: any) {
  const activeScheduleDays = dailySchedules.filter(shouldSummarizeSchedule);

  const groupedWorkHours = groupBy(activeScheduleDays, (dailySchedule) => {
    return `${dailySchedule.start_time}|${dailySchedule.end_time}`;
  });

  const activeBreakDays = dailySchedules.filter(shouldSummarizeBreaks);
  const groupedBreaks = groupBy(activeBreakDays, 'break_duration_minutes');

  const workHoursSummary = Object.keys(groupedWorkHours).map(
    (scheduleTimes) => {
      const sameDailySchedule = groupedWorkHours[scheduleTimes];
      const startDay = sameDailySchedule[0].day;
      const [start_time, end_time] = scheduleTimes.split('|');
      const timeSummary = `from ${start_time.replace(':', 'h')} to ${end_time.replace(':', 'h')}`;

      const lastConsecutiveDay = findLastConsecutiveDay(
        startDay,
        sameDailySchedule,
      );
      const lastConsecutiveDayIdx = sameDailySchedule.findIndex(
        (dailySchedule) => dailySchedule.day === lastConsecutiveDay,
      );
      const allDaysAreConsecutive =
        lastConsecutiveDayIdx === sameDailySchedule.length - 1;

      if (sameDailySchedule.length === 1) {
        return `${capitalize(startDay)}, ${timeSummary}`;
      }

      if (!allDaysAreConsecutive) {
        return sameDailySchedule.reduce((summary, dailySchedule, idx) => {
          const day = capitalize(dailySchedule.day);
          if (idx === sameDailySchedule.length - 1) {
            return `${summary}and ${day}, ${timeSummary}`;
          }

          return `${summary}${day}, `;
        }, '');
      }

      return `${capitalize(startDay)} to ${capitalize(lastConsecutiveDay)}, ${timeSummary}`;
    },
  );

  const breakSummary = Object.keys(groupedBreaks)
    .reverse()
    .map((breakDuration, idx) => {
      const isFirstGroup = idx === 0;
      const sameDailyBreaks = groupedBreaks[breakDuration];
      const breakString = convertBreakDurationToHours(
        parseInt(breakDuration, 10),
      );

      if (Object.keys(groupedBreaks).length === 1) {
        return `With ${breakString} daily breaks`;
      }

      if (sameDailyBreaks.length === 1) {
        const breakText = `${breakString} break on ${capitalize(sameDailyBreaks[0].day)}.`;
        return isFirstGroup ? `With ${breakText}` : breakText;
      }

      return sameDailyBreaks.reduce(
        (summary, dailySchedule, breakIdx) => {
          const day = capitalize(dailySchedule.day);

          if (breakIdx === 0) {
            return `${summary} ${day}`;
          }

          if (breakIdx === sameDailyBreaks.length - 1) {
            return `${summary}, and ${day}.`;
          }

          return `${summary}, ${day}`;
        },
        isFirstGroup
          ? `With ${breakString} break on`
          : `${breakString} break on`,
      );
    });

  return { workHoursSummary, breakSummary };
}

// Calculate hours for each day
export function calculateHours(day: DailySchedule) {
  const { checked, start_time, end_time, break_duration_minutes } = day;
  if (!checked) return 0;

  const [startHour, startMin] = start_time.split(':').map(Number);
  const [endHour, endMin] = end_time.split(':').map(Number);

  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  const workMinutes =
    endTotalMin -
    startTotalMin -
    Number.parseInt(break_duration_minutes || '0');

  const hours = workMinutes / 60;
  return hours === Math.floor(hours) ? hours : hours.toFixed(2);
}

type Weekday = (typeof DAYS_OF_THE_WEEK)[number];

const dayMap: Record<Weekday, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export function getShortWeekday(fullName: Weekday): string {
  return dayMap[fullName];
}
