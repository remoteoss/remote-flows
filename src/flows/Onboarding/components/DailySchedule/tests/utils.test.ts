import {
  calculateWorkingHours,
  convertMinutesToHours,
  convertTimeStringToMinutes,
  getDefaultsFromSchema,
  getWorkHoursBounds,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { DailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/types';

const germanyMetadata: DailyScheduleMetadata = {
  country_name: 'Germany',
  default_break_duration_minutes: 60,
  default_end_time: '18:00',
  default_start_time: '09:00',
  subtract_breaks_in_work_hours: true,
  default_schedule: [
    {
      day: 'monday',
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      hours: 8,
    },
  ],
  work_days: [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ],
  work_hours_per_week: {
    baseline: { minimum: 1, maximum: 48 },
    full_time: { minimum: 31, maximum: 48 },
    part_time: { minimum: 1, maximum: 30 },
  },
};

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
});
