import { DailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  DAYS_OF_THE_WEEK,
  getDefaultsFromSchema,
  getWorkHoursBounds,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';
import { germanyDailyScheduleMetadata as germanyMetadata } from '@/src/flows/Onboarding/components/DailySchedule/tests/fixtures';

describe('DailySchedule utils', () => {
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
      const { work_days: _workDays, ...metadataWithoutWorkDays } =
        germanyMetadata;

      expect(
        getDefaultsFromSchema(metadataWithoutWorkDays as DailyScheduleMetadata)
          .availableWorkDays,
      ).toEqual([DAYS_OF_THE_WEEK]);
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
