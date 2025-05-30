import { JSFField } from '@/src/types/remoteFlows';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import groupBy from 'lodash/groupBy';
import capitalize from 'lodash/capitalize';
import { useFormContext } from 'react-hook-form';
import { useFormFields } from '@/src/context';
import { FormField } from '../../ui/form';
import { Components } from '@/src/types/remoteFlows';

const MINUTES_IN_HOUR = 60;
const DAYS_OF_THE_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

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

function calculateTotalWorkHours(dailySchedules: any[]) {
  const totalWorkHours = dailySchedules.reduce((total, daySchedule) => {
    const sum = daySchedule.hours + total;
    return sum;
  }, 0);

  return Number(totalWorkHours.toFixed(2));
}

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

function shouldSummarizeSchedule(daySchedule: any) {
  return (
    daySchedule.start_time && daySchedule.end_time && daySchedule.hours > 0
  );
}

function shouldSummarizeBreaks(daySchedule: any) {
  return daySchedule.break_duration_minutes > 0;
}

function buildWorkScheduleSummary(dailySchedules: any) {
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

type DailySchedule = {
  day: string;
  start_time: string;
  end_time: string;
  hours: number;
  break_duration_minutes: number;
};

type WorkScheduleFieldProps = JSFField & {
  name: string;
  default: DailySchedule[];
  onChange?: (value: any) => void;
  component?: Components['work-schedule'];
};

export function WorkScheduleField(props: WorkScheduleFieldProps) {
  const { components } = useFormFields();
  const { setValue, control } = useFormContext();

  const CustomWorkScheduleField =
    props.component || components?.['work-schedule'];

  const { workHoursSummary, breakSummary } = buildWorkScheduleSummary(
    props.default,
  );
  const totalWorkHours = calculateTotalWorkHours(props.default);

  useEffect(() => {
    setValue(props.name, props.default);
  }, [props.default, props.name, setValue]);

  if (CustomWorkScheduleField) {
    return (
      <FormField
        control={control}
        name={props.name}
        render={({ field, fieldState }) => {
          return (
            <CustomWorkScheduleField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  props.onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={{
                ...props,
                // @ts-expect-error - defaultFormattedValue is not part of fieldData. It's generated in this component.
                defaultFormattedValue: {
                  workHoursSummary,
                  breakSummary,
                  totalWorkHours,
                },
              }}
            />
          );
        }}
      />
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 RemoteFlows__WorkScheduleField__${props.name}`}
    >
      <p className={`text-sm RemoteFlows__WorkScheduleField__Title`}>
        Work hours
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500">{workHoursSummary.join(', ')}</p>
        <p className="text-sm text-gray-500">{breakSummary.join()}</p>
        <p className="text-sm text-gray-500">
          Total of {totalWorkHours} hours per week
        </p>
      </div>
    </div>
  );
}
