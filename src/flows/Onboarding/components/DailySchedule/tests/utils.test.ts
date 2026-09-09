import {
  buildDailyScheduleSummary,
  calculateWorkingHours,
  convertMinutesToHours,
  convertTimeStringToMinutes,
  getDefaultsFromSchema,
  getWorkHoursBounds,
  DailyScheduleSummaryDay,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { DailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/types';
import { germanyDailyScheduleMetadata as germanyMetadata } from '@/src/flows/Onboarding/components/DailySchedule/tests/fixtures';

const segmentsToText = (
  segments: { text: string; bold?: boolean }[],
): string => segments.map((segment) => segment.text).join('');

describe('DailySchedule utils', () => {
  describe('convertTimeStringToMinutes', () => {
    it('converts HH:MM to minutes', () => {
      expect(convertTimeStringToMinutes('09:30')).toBe(570);
      expect(convertTimeStringToMinutes('00:00')).toBe(0);
    });
  });

  describe('convertMinutesToHours', () => {
    it('returns whole hours as-is', () => {
      expect(convertMinutesToHours(480)).toBe(8);
    });

    it('rounds down to 2 decimal places', () => {
      expect(convertMinutesToHours(460)).toBe(7.66);
    });
  });

  describe('calculateWorkingHours', () => {
    it('returns 0 when start or end time is missing', () => {
      expect(calculateWorkingHours(undefined, '18:00', 60)).toBe(0);
      expect(calculateWorkingHours('09:00', undefined, 60)).toBe(0);
    });

    it('subtracts the break duration when provided', () => {
      expect(calculateWorkingHours('09:00', '18:00', 60)).toBe(8);
    });

    it('ignores the break duration when not provided', () => {
      expect(calculateWorkingHours('09:00', '18:00')).toBe(9);
    });

    it('clamps to 0 when end time is before start time', () => {
      expect(calculateWorkingHours('18:00', '09:00', 0)).toBe(0);
    });
  });

  describe('getDefaultsFromSchema', () => {
    it('normalizes the metadata block to camelCase', () => {
      expect(getDefaultsFromSchema(germanyMetadata)).toEqual({
        subtractBreaksFromWorkHours: true,
        countryName: 'Germany',
        defaultStartTime: '09:00',
        defaultEndTime: '18:00',
        defaultBreakDurationMinutes: 60,
        defaultSchedule: germanyMetadata.default_schedule,
        workHoursPerWeekConfig: germanyMetadata.work_hours_per_week,
        availableWorkDays: germanyMetadata.work_days,
      });
    });

    it('falls back to the full week when work_days is missing', () => {
      const { work_days, ...metadataWithoutWorkDays } = germanyMetadata;
      void work_days;

      expect(
        getDefaultsFromSchema(metadataWithoutWorkDays as DailyScheduleMetadata)
          .availableWorkDays,
      ).toEqual([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]);
    });
  });

  describe('getWorkHoursBounds', () => {
    const { work_hours_per_week: workHoursPerWeekConfig } = germanyMetadata;

    it('resolves full_time bounds', () => {
      expect(
        getWorkHoursBounds(workHoursPerWeekConfig, {
          workSchedule: 'full_time',
        }),
      ).toEqual({ minimum: 31, maximum: 48 });
    });

    it('resolves part_time bounds', () => {
      expect(
        getWorkHoursBounds(workHoursPerWeekConfig, {
          workSchedule: 'part_time',
        }),
      ).toEqual({ minimum: 1, maximum: 30 });
    });

    it('falls back to baseline bounds when work_schedule is unset', () => {
      expect(getWorkHoursBounds(workHoursPerWeekConfig, {})).toEqual({
        minimum: 1,
        maximum: 48,
      });
    });

    it('overrides the minimum to 1 for core business hours', () => {
      expect(
        getWorkHoursBounds(workHoursPerWeekConfig, {
          scheduleType: 'core_business_hours',
          workSchedule: 'full_time',
        }),
      ).toEqual({ minimum: 1, maximum: 48 });
    });
  });

  describe('buildDailyScheduleSummary', () => {
    const weekdaySchedule = (
      overrides: Partial<DailyScheduleSummaryDay> = {},
    ): DailyScheduleSummaryDay[] =>
      (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map(
        (day) => ({
          day,
          start_time: '09:00',
          end_time: '18:00',
          break_duration_minutes: 60,
          ...overrides,
        }),
      );

    it('groups a full run of consecutive days sharing hours and breaks', () => {
      const { workHoursLines, breakLines, totalWeeklyHours } =
        buildDailyScheduleSummary(weekdaySchedule(), true);

      expect(workHoursLines).toHaveLength(1);
      expect(segmentsToText(workHoursLines[0].segments)).toBe(
        'Monday to Friday, from 09h00 to 18h00',
      );
      expect(breakLines).toHaveLength(1);
      expect(segmentsToText(breakLines[0].segments)).toBe(
        'With 1h daily breaks',
      );
      expect(totalWeeklyHours).toBe(40);
    });

    it('renders a single selected day without a range', () => {
      const { workHoursLines } = buildDailyScheduleSummary(
        [
          {
            day: 'monday',
            start_time: '10:00',
            end_time: '14:00',
            break_duration_minutes: 15,
          },
        ],
        true,
      );

      expect(segmentsToText(workHoursLines[0].segments)).toBe(
        'Monday, from 10h00 to 14h00',
      );
    });

    it('lists non-consecutive days sharing the same hours individually', () => {
      const { workHoursLines } = buildDailyScheduleSummary(
        [
          {
            day: 'monday',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 60,
          },
          {
            day: 'wednesday',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 60,
          },
        ],
        true,
      );

      expect(workHoursLines).toHaveLength(1);
      expect(segmentsToText(workHoursLines[0].segments)).toBe(
        'Monday and Wednesday, from 09h00 to 18h00',
      );
    });

    it('splits into separate lines when hours differ across days', () => {
      const { workHoursLines } = buildDailyScheduleSummary(
        [
          {
            day: 'monday',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 60,
          },
          {
            day: 'tuesday',
            start_time: '10:00',
            end_time: '16:00',
            break_duration_minutes: 30,
          },
        ],
        true,
      );

      expect(workHoursLines).toHaveLength(2);
      expect(segmentsToText(workHoursLines[0].segments)).toBe(
        'Monday, from 09h00 to 18h00',
      );
      expect(segmentsToText(workHoursLines[1].segments)).toBe(
        'Tuesday, from 10h00 to 16h00',
      );
    });

    it('describes per-day breaks when they differ across days', () => {
      const { breakLines } = buildDailyScheduleSummary(
        [
          {
            day: 'monday',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 60,
          },
          {
            day: 'tuesday',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 30,
          },
        ],
        true,
      );

      expect(breakLines).toHaveLength(2);
      expect(segmentsToText(breakLines[0].segments)).toBe(
        'With 1h break on Monday.',
      );
      expect(segmentsToText(breakLines[1].segments)).toBe(
        'With 30m break on Tuesday.',
      );
    });

    it('omits break lines for days with no break', () => {
      const { breakLines } = buildDailyScheduleSummary(
        [
          {
            day: 'monday',
            start_time: '09:00',
            end_time: '18:00',
            break_duration_minutes: 0,
          },
        ],
        true,
      );

      expect(breakLines).toHaveLength(0);
    });

    it('ignores break duration in the total when subtractBreaksFromWorkHours is false', () => {
      const { totalWeeklyHours } = buildDailyScheduleSummary(
        weekdaySchedule(),
        false,
      );

      expect(totalWeeklyHours).toBe(45);
    });
  });
});
